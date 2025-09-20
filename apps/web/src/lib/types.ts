import type {
  GmOutType,
  MessageType,
  PlayerType,
  SessionType,
  StoryStateType,
} from './zod';

export type { GmOutType, MessageType, PlayerType, SessionType, StoryStateType };

export type LobbyPlayer = PlayerType & { isReady?: boolean };
