import { useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Message, Player, Session, StoryState } from '../../lib/zod';
import type { MessageType, PlayerType } from '../../lib/types';
import { useGameStore } from '../../state/useGameStore';

export function useSessionSubscriptions(sessionId: string | null | undefined) {
  const setSession = useGameStore((state) => state.setSession);
  const setPlayers = useGameStore((state) => state.setPlayers);
  const setMessages = useGameStore((state) => state.setMessages);
  const setStoryState = useGameStore((state) => state.setStoryState);

  useEffect(() => {
    if (!sessionId) return;

    const unsubSession = onSnapshot(
      doc(db, 'sessions', sessionId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const raw = snapshot.data();
        const data = Session.safeParse({
          id: snapshot.id,
          ...raw,
          createdAt:
            typeof raw.createdAt === 'number'
              ? raw.createdAt
              : (raw.createdAt?.toMillis?.() ?? Date.now()),
        });
        if (data.success) {
          setSession(data.data);
        }
      },
    );

    const playersQuery = query(
      collection(db, 'players'),
      where('sessionId', '==', sessionId),
      orderBy('joinedAt', 'asc'),
    );

    const unsubPlayers = onSnapshot(playersQuery, (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => {
          const payload = docSnap.data();
          const parsed = Player.safeParse({
            id: docSnap.id,
            ...payload,
            joinedAt:
              typeof payload.joinedAt === 'number'
                ? payload.joinedAt
                : (payload.joinedAt?.toMillis?.() ?? Date.now()),
          });
          return parsed.success ? parsed.data : null;
        })
        .filter(Boolean) as PlayerType[];
      setPlayers(items);
    });

    const messagesQuery = query(
      collection(db, 'messages'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'asc'),
    );

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => {
          const payload = docSnap.data();
          const parsed = Message.safeParse({
            id: docSnap.id,
            ...payload,
            createdAt:
              typeof payload.createdAt === 'number'
                ? payload.createdAt
                : (payload.createdAt?.toMillis?.() ?? Date.now()),
          });
          return parsed.success ? parsed.data : null;
        })
        .filter(Boolean) as MessageType[];
      setMessages(items);
    });

    const unsubStory = onSnapshot(
      doc(db, 'storyStates', sessionId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const payload = snapshot.data();
        const parsed = StoryState.safeParse({
          sessionId: snapshot.id,
          ...payload,
        });
        if (parsed.success) {
          setStoryState(parsed.data);
        }
      },
    );

    return () => {
      unsubSession();
      unsubPlayers();
      unsubMessages();
      unsubStory();
    };
  }, [sessionId, setMessages, setPlayers, setSession, setStoryState]);
}
