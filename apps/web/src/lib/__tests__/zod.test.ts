import { describe, expect, it } from 'vitest';
import { GmOut, Session } from '../zod';

describe('zod schemas', () => {
  it('validates session codes', () => {
    expect(() =>
      Session.parse({
        id: '1',
        code: 'ABC123',
        status: 'lobby',
        ownerId: 'u1',
      }),
    ).not.toThrow();
    expect(() =>
      Session.parse({ id: '1', code: 'SHORT', status: 'lobby', ownerId: 'u1' }),
    ).toThrow();
  });

  it('caps narration length', () => {
    const result = GmOut.safeParse({
      narration: 'Опис',
      publicHints: ['Підказка'],
    });
    expect(result.success).toBe(true);
  });
});
