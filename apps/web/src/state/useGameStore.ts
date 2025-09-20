import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MessageType,
  PlayerType,
  SessionType,
  StoryStateType,
} from '../lib/types';

type GameState = {
  playerId: string | null;
  session: SessionType | null;
  sessionCode: string | null;
  sessionId: string | null;
  isOwner: boolean;
  players: PlayerType[];
  messages: MessageType[];
  storyState: StoryStateType | null;
  gmStream: string[];
  setPlayerId: (id: string | null) => void;
  setSession: (session: SessionType | null, code?: string) => void;
  setSessionRef: (sessionId: string, code?: string) => void;
  setPlayers: (players: PlayerType[]) => void;
  setMessages: (messages: MessageType[]) => void;
  appendMessage: (message: MessageType) => void;
  setStoryState: (state: StoryStateType | null) => void;
  updateStoryFromGm: (data: Partial<StoryStateType>) => void;
  patchStoryFlags: (flags: Record<string, unknown>) => void;
  pushGmChunk: (chunk: string) => void;
  resetGmStream: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerId: null,
      session: null,
      sessionCode: null,
      sessionId: null,
      isOwner: false,
      players: [],
      messages: [],
      storyState: null,
      gmStream: [],
      setPlayerId: (id) =>
        set((state) => ({
          playerId: id,
          isOwner: state.session ? state.session.ownerId === id : false,
        })),
      setSession: (session, code) =>
        set({
          session,
          sessionCode: code ?? session?.code ?? null,
          sessionId: session?.id ?? null,
          isOwner: session ? session.ownerId === get().playerId : false,
        }),
      setSessionRef: (sessionId, code) =>
        set((state) => ({
          sessionId,
          sessionCode: code ?? state.sessionCode,
          isOwner: state.session
            ? state.session.ownerId === state.playerId
            : state.isOwner,
        })),
      setPlayers: (players) => set({ players }),
      setMessages: (messages) => set({ messages }),
      appendMessage: (message) =>
        set({ messages: [...get().messages, message] }),
      setStoryState: (state) => set({ storyState: state }),
      updateStoryFromGm: (data) => {
        const current = get().storyState;
        if (current) {
          set({ storyState: { ...current, ...data } });
        } else if (get().sessionId) {
          set({
            storyState: {
              sessionId: get().sessionId!,
              narration: data.narration ?? '',
              publicHints: data.publicHints ?? [],
              privateHints: data.privateHints,
              flags: data.flags ?? {},
              inventory: data.inventory ?? [],
            },
          });
        }
      },
      patchStoryFlags: (flags) => {
        const current = get().storyState;
        if (!current) return;
        set({
          storyState: { ...current, flags: { ...current.flags, ...flags } },
        });
      },
      pushGmChunk: (chunk) => set({ gmStream: [...get().gmStream, chunk] }),
      resetGmStream: () => set({ gmStream: [] }),
      reset: () =>
        set({
          session: null,
          sessionCode: null,
          sessionId: null,
          isOwner: false,
          players: [],
          messages: [],
          storyState: null,
          gmStream: [],
        }),
    }),
    {
      name: 'arcane-relay-store',
      partialize: (state) => ({
        sessionCode: state.sessionCode,
        sessionId: state.sessionId,
      }),
    },
  ),
);
