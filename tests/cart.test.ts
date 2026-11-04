import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from '../src/cart.js';

describe('Cart', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('should add an item with default quantity 1', () => {
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450 });
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0]).toEqual({
      id: '1',
      name: 'Coffee',
      priceMinor: 450,
      quantity: 1,
    });
  });

  it('should increment quantity if item already exists', () => {
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450, quantity: 2 });
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450, quantity: 3 });
    expect(cart.getItems()[0].quantity).toBe(5);
  });

  it('should correctly calculate total in minor units', () => {
    cart.addItem({ id: '1', name: 'Espresso', priceMinor: 250, quantity: 2 }); // 500
    cart.addItem({ id: '2', name: 'Latte', priceMinor: 450, quantity: 1 });    // 450
    expect(cart.getTotalMinor()).toBe(950);
  });

  it('should remove an item completely if no quantity specified', () => {
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450, quantity: 2 });
    cart.removeItem('1');
    expect(cart.getItems()).toHaveLength(0);
  });

  it('should decrement quantity if quantity specified', () => {
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450, quantity: 5 });
    cart.removeItem('1', 2);
    expect(cart.getItems()[0].quantity).toBe(3);
  });

  it('should clear all items', () => {
    cart.addItem({ id: '1', name: 'Coffee', priceMinor: 450 });
    cart.addItem({ id: '2', name: 'Tea', priceMinor: 300 });
    cart.clear();
    expect(cart.getItems()).toHaveLength(0);
    expect(cart.getTotalMinor()).toBe(0);
  });
});

describe('Cart discounts, tax rates and payment', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
    cart.addItem({ id: 'a', name: 'Coffee', priceMinor: 1000, quantity: 2 });
    cart.addItem({ id: 'b', name: 'Tea', priceMinor: 500 });
  });

  it('drops item-targeted discounts when the item is fully removed', () => {
    cart.applyDiscount({ id: 'd1', name: 'Coffee promo', type: 'fixed', value: 100, targetItemId: 'a' });
    cart.applyDiscount({ id: 'd2', name: 'Cart promo', type: 'percentage', value: 10 });

    cart.removeItem('a');

    expect(cart.getDiscounts().map((d) => d.id)).toEqual(['d2']);
  });

  it('keeps item-targeted discounts on a partial quantity removal', () => {
    cart.applyDiscount({ id: 'd1', name: 'Coffee promo', type: 'fixed', value: 100, targetItemId: 'a' });

    cart.removeItem('a', 1);

    expect(cart.getDiscounts()).toHaveLength(1);
    expect(cart.getItems().find((i) => i.id === 'a')?.quantity).toBe(1);
  });

  it('removes the whole item when the removed quantity is at least the current quantity', () => {
    cart.removeItem('a', 5);
    expect(cart.getItems().map((i) => i.id)).toEqual(['b']);
  });

  it('ignores removal of an unknown item', () => {
    cart.removeItem('missing');
    expect(cart.getItems()).toHaveLength(2);
  });

  it('clear() removes discounts but keeps registered tax rates', () => {
    cart.addTaxRate({ id: 'vat', name: 'VAT', ratePercent: 18 });
    cart.applyDiscount({ id: 'd2', name: 'Cart promo', type: 'percentage', value: 10 });

    cart.clear();

    expect(cart.getDiscounts()).toHaveLength(0);
    expect(cart.getTaxRates()).toHaveLength(1);
  });

  it('resets the default tax rate when that rate is removed', () => {
    cart.addTaxRate({ id: 'vat', name: 'VAT', ratePercent: 18 });
    cart.setDefaultTaxRateId('vat');

    cart.removeTaxRate('vat');

    expect(cart.getDefaultTaxRateId()).toBeUndefined();
  });

  it('updates the tax rate of an existing item only when one is provided', () => {
    cart.addItem({ id: 'b', name: 'Tea', priceMinor: 500, taxRateId: 'vat' });
    cart.addItem({ id: 'b', name: 'Tea', priceMinor: 500 });

    expect(cart.getItems().find((i) => i.id === 'b')?.taxRateId).toBe('vat');
  });

  it('creates a payment session for the current cart total', () => {
    cart.applyDiscount({ id: 'd2', name: 'Cart promo', type: 'percentage', value: 10 });

    const session = cart.createPaymentSession();

    expect(cart.getSubtotalMinor()).toBe(2500);
    expect(session.getOriginalDueMinor()).toBe(cart.getTotalMinor());
    expect(session.getOriginalDueMinor()).toBe(2250);
  });
});
