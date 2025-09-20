import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import {
  CreateSessionInput,
  CreateSessionResponse,
  JoinSessionInput,
  JoinSessionResponse,
  SendMessageInput,
  StartSessionInput,
  ValidatePuzzleInput,
  ValidatePuzzleResponse,
} from './zod';

export type CreateSessionPayload = typeof CreateSessionInput._input;
export type CreateSessionResult = typeof CreateSessionResponse._output;
export type JoinSessionPayload = typeof JoinSessionInput._input;
export type JoinSessionResult = typeof JoinSessionResponse._output;
export type StartSessionPayload = typeof StartSessionInput._input;
export type SendMessagePayload = typeof SendMessageInput._input;
export type ValidatePuzzlePayload = typeof ValidatePuzzleInput._input;
export type ValidatePuzzleResult = typeof ValidatePuzzleResponse._output;

function callable<TData, TResult>(name: string) {
  return async (data: TData) => {
    const fn = httpsCallable<TData, TResult>(functions, name);
    const result = await fn(data);
    return result.data;
  };
}

export const api = {
  createSession: async (payload: CreateSessionPayload) => {
    const parsed = CreateSessionInput.parse(payload);
    return callable<CreateSessionPayload, CreateSessionResult>('createSession')(
      parsed,
    );
  },
  joinSession: async (payload: JoinSessionPayload) => {
    const parsed = JoinSessionInput.parse(payload);
    return callable<JoinSessionPayload, JoinSessionResult>('joinSessionByCode')(
      parsed,
    );
  },
  startSession: async (payload: StartSessionPayload) => {
    const parsed = StartSessionInput.parse(payload);
    return callable<StartSessionPayload, void>('startSession')(parsed);
  },
  sendMessage: async (payload: SendMessagePayload) => {
    const parsed = SendMessageInput.parse(payload);
    return callable<SendMessagePayload, void>('sendMessage')(parsed);
  },
  validatePuzzle: async (payload: ValidatePuzzlePayload) => {
    const parsed = ValidatePuzzleInput.parse(payload);
    return callable<ValidatePuzzlePayload, ValidatePuzzleResult>(
      'validatePuzzle',
    )(parsed);
  },
};
