import { describe, it, expect } from 'vitest';
import { assertPositiveInteger } from '../src/validation.js';

describe('assertPositiveInteger', () => {
  it('accepts positive integers', () => {
    expect(() => assertPositiveInteger(1, 'bad')).not.toThrow();
    expect(() => assertPositiveInteger(Number.MAX_SAFE_INTEGER, 'bad')).not.toThrow();
  });

  it.each([0, -1, 1.5, NaN, Infinity])('rejects %s with the given message', (value) => {
    expect(() => assertPositiveInteger(value, 'bad value')).toThrow('bad value');
  });
});
