import { describe, it, expect } from 'vitest';
import { Cart } from '../src/cart.js';

describe('Cart.applyDiscount validation', () => {
  it.each([-10, NaN, Infinity])('rejects a discount value of %s', (value) => {
    const cart = new Cart();
    expect(() => cart.applyDiscount({ id: 'd', name: 'D', type: 'fixed', value })).toThrow(
      'Discount value must be a non-negative number'
    );
    expect(cart.getDiscounts()).toHaveLength(0);
  });

  it('rejects percentages above 100', () => {
    const cart = new Cart();
    expect(() => cart.applyDiscount({ id: 'd', name: 'D', type: 'percentage', value: 150 })).toThrow(
      'Percentage discount cannot exceed 100'
    );
  });

  it('allows a fixed discount above 100 minor units', () => {
    const cart = new Cart();
    cart.addItem({ id: 'a', name: 'A', priceMinor: 1000 });
    cart.applyDiscount({ id: 'd', name: 'D', type: 'fixed', value: 250 });
    expect(cart.getDiscountTotalMinor()).toBe(250);
  });

  it.each([-1, 2.5])('rejects a maxDiscountMinor of %s', (maxDiscountMinor) => {
    const cart = new Cart();
    expect(() =>
      cart.applyDiscount({ id: 'd', name: 'D', type: 'percentage', value: 10, maxDiscountMinor })
    ).toThrow('Discount cap');
  });

  it('keeps the previous discount when an invalid update is rejected', () => {
    const cart = new Cart();
    cart.addItem({ id: 'a', name: 'A', priceMinor: 1000 });
    cart.applyDiscount({ id: 'd', name: 'D', type: 'percentage', value: 10 });
    expect(() => cart.applyDiscount({ id: 'd', name: 'D', type: 'percentage', value: 120 })).toThrow();
    expect(cart.getDiscountTotalMinor()).toBe(100);
  });
});
