import { describe, it, expect } from 'vitest';
import { calculateBuyXGetYDiscount } from '../src/discount.js';

describe('calculateBuyXGetYDiscount', () => {
  it('gives one free unit per complete buy 2 get 1 bundle', () => {
    expect(calculateBuyXGetYDiscount(500, 3, 2, 1)).toBe(500);
    expect(calculateBuyXGetYDiscount(500, 6, 2, 1)).toBe(1000);
  });

  it('gives nothing when fewer units than the paid quantity are bought', () => {
    expect(calculateBuyXGetYDiscount(500, 0, 2, 1)).toBe(0);
    expect(calculateBuyXGetYDiscount(500, 1, 2, 1)).toBe(0);
    expect(calculateBuyXGetYDiscount(500, 2, 2, 1)).toBe(0);
  });

  it('counts free units from a trailing partial bundle once buy units are covered', () => {
    // buy 1 get 2: bundles of 3 units; 2 units -> 1 free, 4 units -> 2 free, 5 units -> 3 free
    expect(calculateBuyXGetYDiscount(100, 2, 1, 2)).toBe(100);
    expect(calculateBuyXGetYDiscount(100, 4, 1, 2)).toBe(200);
    expect(calculateBuyXGetYDiscount(100, 5, 1, 2)).toBe(300);
  });

  it('never discounts more than the line total', () => {
    for (let qty = 0; qty <= 30; qty++) {
      expect(calculateBuyXGetYDiscount(250, qty, 3, 2)).toBeLessThanOrEqual(250 * qty);
    }
  });

  it('returns zero for a free item', () => {
    expect(calculateBuyXGetYDiscount(0, 10, 1, 1)).toBe(0);
  });

  it('rejects invalid arguments', () => {
    expect(() => calculateBuyXGetYDiscount(-1, 3, 2, 1)).toThrow();
    expect(() => calculateBuyXGetYDiscount(10.5, 3, 2, 1)).toThrow();
    expect(() => calculateBuyXGetYDiscount(500, 1.5, 2, 1)).toThrow();
    expect(() => calculateBuyXGetYDiscount(500, 3, 0, 1)).toThrow();
    expect(() => calculateBuyXGetYDiscount(500, 3, 2, 0)).toThrow();
  });
});
