import { z } from 'zod';

export const SessionStatus = z.enum(['lobby', 'active', 'finished']);

export const Session = z.object({
  id: z.string(),
  code: z.string().length(6),
  status: SessionStatus,
  ownerId: z.string(),
  createdAt: z.number().optional(),
});

export const Player = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  displayName: z.string().min(1).max(50),
  isOwner: z.boolean(),
  joinedAt: z.number(),
});

export const Message = z.object({
  id: z.string(),
  sessionId: z.string(),
  author: z.enum(['player', 'gm', 'npc']),
  playerId: z.string().nullable(),
  text: z.string().min(1).max(2000),
  createdAt: z.number(),
});

export const StoryState = z.object({
  sessionId: z.string(),
  narration: z.string().default(''),
  publicHints: z.array(z.string()).default([]),
  privateHints: z.record(z.string(), z.array(z.string())).optional(),
  flags: z
    .record(z.string(), z.union([z.boolean(), z.string(), z.number()]))
    .default({}),
  inventory: z.array(z.string()).default([]),
});

export const GmOut = z.object({
  narration: z.string().max(600),
  publicHints: z.array(z.string()).max(5),
  privateHints: z.record(z.string(), z.array(z.string())).optional(),
});

export const CreateSessionInput = z.object({
  displayName: z.string().min(2).max(50),
});

export const CreateSessionResponse = z.object({
  sessionId: z.string(),
  code: z.string().length(6),
});

export const JoinSessionInput = z.object({
  code: z.string().length(6),
  displayName: z.string().min(2).max(50),
});

export const JoinSessionResponse = z.object({
  sessionId: z.string(),
});

export const StartSessionInput = z.object({
  sessionId: z.string(),
});

export const SendMessageInput = z.object({
  sessionId: z.string(),
  text: z.string().min(1).max(2000),
});

export const ValidatePuzzleInput = z.object({
  sessionId: z.string(),
  answer: z.string().min(1),
});

export const ValidatePuzzleResponse = z.object({
  correct: z.boolean(),
});

export type SessionType = z.infer<typeof Session>;
export type PlayerType = z.infer<typeof Player>;
export type MessageType = z.infer<typeof Message>;
export type StoryStateType = z.infer<typeof StoryState>;
export type GmOutType = z.infer<typeof GmOut>;
