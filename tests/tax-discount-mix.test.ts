import { describe, it, expect } from 'vitest';
import { Cart } from '../src/cart.js';

function buildMixedCart(): Cart {
  const cart = new Cart();
  cart.addTaxRate({ id: 'ex', name: 'Sales tax', ratePercent: 10 });
  cart.addTaxRate({ id: 'in', name: 'VAT', ratePercent: 20, isInclusive: true });
  cart.addItem({ id: 'a', name: 'Gadget', priceMinor: 1000, taxRateId: 'ex' });
  cart.addItem({ id: 'b', name: 'Book', priceMinor: 2000, taxRateId: 'in' });
  return cart;
}

describe('Cart: mixed inclusive/exclusive tax with discounts', () => {
  it('computes each tax on its own discounted base', () => {
    const cart = buildMixedCart();
    cart.applyDiscount({ id: 'd1', name: 'Gadget promo', type: 'fixed', value: 200, targetItemId: 'a' });
    cart.applyDiscount({ id: 'd2', name: 'Loyalty', type: 'percentage', value: 10 });

    // 1000 - 200 = 800 and 2000 -> 2800; 10% cart discount = 280 -> ratio 0.9
    const summary = cart.getTaxSummary();
    const ex = summary.breakdown.find((l) => l.taxRateId === 'ex');
    const inc = summary.breakdown.find((l) => l.taxRateId === 'in');

    expect(ex).toMatchObject({ taxableBaseMinor: 720, taxAmountMinor: 72, isInclusive: false });
    expect(inc).toMatchObject({ taxableBaseMinor: 1800, taxAmountMinor: 300, isInclusive: true });
    expect(summary.exclusiveTaxMinor).toBe(72);
    expect(summary.inclusiveTaxMinor).toBe(300);
    expect(summary.totalTaxMinor).toBe(372);
  });

  it('adds only exclusive tax on top of the discounted subtotal', () => {
    const cart = buildMixedCart();
    cart.applyDiscount({ id: 'd1', name: 'Gadget promo', type: 'fixed', value: 200, targetItemId: 'a' });
    cart.applyDiscount({ id: 'd2', name: 'Loyalty', type: 'percentage', value: 10 });

    expect(cart.getSubtotalMinor()).toBe(3000);
    expect(cart.getDiscountTotalMinor()).toBe(480);
    // 3000 - 480 + 72 exclusive tax; inclusive tax is already in the price
    expect(cart.getTotalMinor()).toBe(2592);
  });

  it('charges no tax on a fully discounted item', () => {
    const cart = buildMixedCart();
    cart.applyDiscount({ id: 'free', name: 'Free gadget', type: 'percentage', value: 100, targetItemId: 'a' });

    const summary = cart.getTaxSummary();
    expect(summary.breakdown.map((l) => l.taxRateId)).toEqual(['in']);
    expect(summary.exclusiveTaxMinor).toBe(0);
    expect(summary.inclusiveTaxMinor).toBe(333);
  });

  it('merges items sharing a rate into a single breakdown line', () => {
    const cart = buildMixedCart();
    cart.addItem({ id: 'c', name: 'Magazine', priceMinor: 600, taxRateId: 'in' });

    const inclusiveLines = cart.getTaxSummary().breakdown.filter((l) => l.taxRateId === 'in');
    expect(inclusiveLines).toHaveLength(1);
    expect(inclusiveLines[0].taxableBaseMinor).toBe(2600);
    expect(inclusiveLines[0].taxAmountMinor).toBe(433);
  });
});
