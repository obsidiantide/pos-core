import { describe, it, expect } from 'vitest';
import { Cart } from '../src/cart.js';

function buildCart(): Cart {
  const cart = new Cart();
  cart.addTaxRate({ id: 'vat', name: 'VAT', ratePercent: 18, isInclusive: true });
  cart.setDefaultTaxRateId('vat');
  cart.addItem({ id: 'a', name: 'Coffee', priceMinor: 450, quantity: 2 });
  cart.addItem({ id: 'b', name: 'Cake', priceMinor: 700 });
  cart.applyDiscount({ id: 'd1', name: '10%', type: 'percentage', value: 10 });
  return cart;
}

describe('Cart snapshot', () => {
  it('round-trips through JSON with identical totals', () => {
    const cart = buildCart();
    const restored = Cart.fromJSON(JSON.parse(JSON.stringify(cart)));

    expect(restored.getItems()).toEqual(cart.getItems());
    expect(restored.getDiscounts()).toEqual(cart.getDiscounts());
    expect(restored.getTaxRates()).toEqual(cart.getTaxRates());
    expect(restored.getDefaultTaxRateId()).toBe('vat');
    expect(restored.getSubtotalMinor()).toBe(cart.getSubtotalMinor());
    expect(restored.getTotalMinor()).toBe(cart.getTotalMinor());
  });

  it('snapshot is a copy: mutating it does not change the cart', () => {
    const cart = buildCart();
    const snap = cart.toJSON();
    snap.items[0].quantity = 99;
    snap.discounts.length = 0;
    expect(cart.getItems()[0].quantity).toBe(2);
    expect(cart.getDiscounts()).toHaveLength(1);
  });

  it('restoring does not alias the snapshot', () => {
    const snap = buildCart().toJSON();
    const restored = Cart.fromJSON(snap);
    restored.addItem({ id: 'a', name: 'Coffee', priceMinor: 450 });
    expect(snap.items[0].quantity).toBe(2);
  });

  it('rejects invalid quantities in a snapshot', () => {
    const snap = buildCart().toJSON();
    snap.items[0].quantity = 0;
    expect(() => Cart.fromJSON(snap)).toThrow();
  });

  it('handles an empty cart', () => {
    const restored = Cart.fromJSON(new Cart().toJSON());
    expect(restored.getItems()).toEqual([]);
    expect(restored.getTotalMinor()).toBe(0);
  });
});
