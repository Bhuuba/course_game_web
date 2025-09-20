import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { z } from 'zod';

declare global {
  var __rateLimits: Map<string, { count: number; reset: number }> | undefined;
}

admin.initializeApp();

const db = admin.firestore();

type RateConfig = {
  limit: number;
  windowMs: number;
};

const defaultRate: RateConfig = { limit: 60, windowMs: 60_000 };

function getLimiter() {
  if (!globalThis.__rateLimits) {
    globalThis.__rateLimits = new Map();
  }
  return globalThis.__rateLimits;
}

function enforceRateLimit(key: string, config: RateConfig = defaultRate) {
  const now = Date.now();
  const limits = getLimiter();
  const record = limits.get(key);
  if (!record || record.reset < now) {
    limits.set(key, { count: 1, reset: now + config.windowMs });
    return;
  }
  if (record.count >= config.limit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many requests',
    );
  }
  record.count += 1;
}

function contextKey(context: functions.https.CallableContext) {
  return context.auth?.uid ?? context.rawRequest.ip ?? 'anon';
}

function requestKey(request: functions.https.Request) {
  return (
    request.ip ?? request.headers['x-forwarded-for']?.toString() ?? 'unknown'
  );
}

const createSessionSchema = z.object({
  displayName: z.string().min(2).max(50),
});

const joinSessionSchema = z.object({
  code: z.string().length(6),
  displayName: z.string().min(2).max(50),
});

const startSessionSchema = z.object({
  sessionId: z.string(),
});

const sendMessageSchema = z.object({
  sessionId: z.string(),
  text: z.string().min(1).max(2000),
});

const validatePuzzleSchema = z.object({
  sessionId: z.string(),
  answer: z.string().min(1),
});

async function generateSessionCode(): Promise<string> {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let attempts = 0;
  while (attempts < 10) {
    attempts += 1;
    const code = Array.from(
      { length: 6 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join('');
    const existing = await db
      .collection('sessions')
      .where('code', '==', code)
      .limit(1)
      .get();
    if (existing.empty) {
      return code;
    }
  }
  throw new functions.https.HttpsError(
    'internal',
    'Unable to generate session code',
  );
}

export const createSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required',
    );
  }
  enforceRateLimit(contextKey(context));
  const payload = createSessionSchema.parse(data);
  const code = await generateSessionCode();
  const now = admin.firestore.Timestamp.now();
  const sessionRef = db.collection('sessions').doc();
  await sessionRef.set({
    code,
    status: 'lobby',
    ownerId: context.auth.uid,
    createdAt: now,
  });
  await db
    .collection('players')
    .doc(`${sessionRef.id}_${context.auth.uid}`)
    .set({
      sessionId: sessionRef.id,
      userId: context.auth.uid,
      displayName: payload.displayName,
      isOwner: true,
      joinedAt: now,
    });
  await db.collection('storyStates').doc(sessionRef.id).set({
    sessionId: sessionRef.id,
    narration: '',
    publicHints: [],
    privateHints: {},
    flags: {},
    inventory: [],
    updatedAt: now,
  });
  return { sessionId: sessionRef.id, code };
});

export const joinSessionByCode = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required',
      );
    }
    enforceRateLimit(contextKey(context));
    const payload = joinSessionSchema.parse(data);
    const sessionSnap = await db
      .collection('sessions')
      .where('code', '==', payload.code)
      .limit(1)
      .get();
    if (sessionSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Session not found');
    }
    const sessionDoc = sessionSnap.docs[0];
    const sessionId = sessionDoc.id;
    const playerRef = db
      .collection('players')
      .doc(`${sessionId}_${context.auth.uid}`);
    const now = admin.firestore.Timestamp.now();
    await playerRef.set(
      {
        sessionId,
        userId: context.auth.uid,
        displayName: payload.displayName,
        isOwner: sessionDoc.get('ownerId') === context.auth.uid,
        joinedAt: now,
      },
      { merge: true },
    );
    return { sessionId };
  },
);

export const startSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required',
    );
  }
  enforceRateLimit(contextKey(context));
  const payload = startSessionSchema.parse(data);
  const sessionRef = db.collection('sessions').doc(payload.sessionId);
  const session = await sessionRef.get();
  if (!session.exists) {
    throw new functions.https.HttpsError('not-found', 'Session not found');
  }
  if (session.get('ownerId') !== context.auth.uid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only the owner can start the session',
    );
  }
  await sessionRef.update({ status: 'active' });
});

export const sendMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required',
    );
  }
  enforceRateLimit(contextKey(context), { limit: 120, windowMs: 60_000 });
  const payload = sendMessageSchema.parse(data);
  const now = admin.firestore.Timestamp.now();
  await db.collection('messages').add({
    sessionId: payload.sessionId,
    author: 'player',
    playerId: context.auth.uid,
    text: payload.text,
    createdAt: now,
  });
});

export const validatePuzzle = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required',
    );
  }
  enforceRateLimit(contextKey(context));
  const payload = validatePuzzleSchema.parse(data);
  const answer = payload.answer.trim().toUpperCase();
  const correct = answer === 'TRI-CIRCLE-SQUARE';
  if (correct) {
    await db
      .collection('storyStates')
      .doc(payload.sessionId)
      .set({ flags: { openedDoorA: true } }, { merge: true });
  }
  return { correct };
});

export const gmSse = functions.https.onRequest(async (req, res) => {
  enforceRateLimit(requestKey(req));
  const sessionId = req.query.sessionId?.toString();
  if (!sessionId) {
    res.status(400).send('sessionId is required');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const chunks = ['(GM набирає текст…)', '(трохи ще…)', '(майже готово…)'];
  for (const chunk of chunks) {
    res.write(`data: ${chunk}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const finalPayload = {
    narration: 'Двері здригнулися. Символи тьмяно спалахнули.',
    publicHints: ['Порядок символів важливий'],
    privateHints: {},
  };
  await db.collection('storyStates').doc(sessionId).set(
    {
      narration: finalPayload.narration,
      publicHints: finalPayload.publicHints,
      updatedAt: admin.firestore.Timestamp.now(),
    },
    { merge: true },
  );

  res.write(`data: ${JSON.stringify(finalPayload)}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
});
