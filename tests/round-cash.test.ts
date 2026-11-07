import { describe, expect, it } from 'vitest';
import { roundCashAmount } from '../src/payment.js';

const intervals = [5, 10, 25, 50, 100];
const directions = ['nearest', 'up', 'down'] as const;
const amounts = Array.from({ length: 2001 }, (_, i) => i - 1000);

describe('roundCashAmount invariants', () => {
  for (const interval of intervals) {
    for (const direction of directions) {
      describe(`interval ${interval}, ${direction}`, () => {
        it('always returns a multiple of the interval', () => {
          for (const amount of amounts) {
            const result = roundCashAmount(amount, interval, direction);
            expect(Math.abs(result) % interval).toBe(0);
          }
        });

        it('is idempotent', () => {
          for (const amount of amounts) {
            const once = roundCashAmount(amount, interval, direction);
            expect(roundCashAmount(once, interval, direction)).toBe(once);
          }
        });

        it('moves the amount by less than one interval', () => {
          for (const amount of amounts) {
            const result = roundCashAmount(amount, interval, direction);
            const limit = direction === 'nearest' ? interval / 2 : interval;
            expect(Math.abs(result - amount)).toBeLessThanOrEqual(limit);
          }
        });

        it('is symmetric around zero', () => {
          for (const amount of amounts) {
            const positive = roundCashAmount(amount, interval, direction);
            const negative = roundCashAmount(-amount, interval, direction);
            expect(negative + 0).toBe(-positive + 0);
          }
        });
      });
    }
  }

  it('never rounds down above or up below the original amount for positives', () => {
    for (const amount of amounts.filter((a) => a > 0)) {
      expect(roundCashAmount(amount, 5, 'down')).toBeLessThanOrEqual(amount);
      expect(roundCashAmount(amount, 5, 'up')).toBeGreaterThanOrEqual(amount);
    }
  });
});
