import { describe, it, expect } from 'vitest';
import { assertNonNegativeInteger, assertPositiveInteger } from '../src/validation.js';
import { Cart } from '../src/cart.js';

describe('assertPositiveInteger', () => {
  it('accepts positive integers', () => {
    expect(() => assertPositiveInteger(1, 'bad')).not.toThrow();
    expect(() => assertPositiveInteger(Number.MAX_SAFE_INTEGER, 'bad')).not.toThrow();
  });

  it.each([0, -1, 1.5, NaN, Infinity])('rejects %s with the given message', (value) => {
    expect(() => assertPositiveInteger(value, 'bad value')).toThrow('bad value');
  });
});

describe('assertNonNegativeInteger', () => {
  it('accepts zero and positive integers', () => {
    expect(() => assertNonNegativeInteger(0, 'bad')).not.toThrow();
    expect(() => assertNonNegativeInteger(42, 'bad')).not.toThrow();
  });

  it.each([-1, 0.5, NaN, Infinity])('rejects %s with the given message', (value) => {
    expect(() => assertNonNegativeInteger(value, 'bad value')).toThrow('bad value');
  });
});

describe('Cart.addItem price validation', () => {
  it('allows free items', () => {
    const cart = new Cart();
    cart.addItem({ id: 'gift', name: 'Gift', priceMinor: 0 });
    expect(cart.getSubtotalMinor()).toBe(0);
  });

  it.each([-100, 12.5, NaN])('rejects price %s and leaves the cart unchanged', (priceMinor) => {
    const cart = new Cart();
    expect(() => cart.addItem({ id: 'x', name: 'X', priceMinor })).toThrow('Item price');
    expect(cart.getItems()).toHaveLength(0);
  });
});
