import { describe, expect, it } from 'vitest';
import { formatNarration } from '../utils';

describe('formatNarration', () => {
  it('collapses excessive whitespace', () => {
    expect(formatNarration('Hello    world')).toBe('Hello world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(formatNarration('  \nArcane tale  ')).toBe('Arcane tale');
  });
});
