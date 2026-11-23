import { describe, expect, it } from 'vitest';
import { apportionTaxableBase, summarizeTaxBreakdown, TaxLineBreakdown } from '../src/index.js';

describe('apportionTaxableBase', () => {
  it('returns the item net unchanged when there is no cart discount', () => {
    expect(apportionTaxableBase(500, 1000, 0)).toBe(500);
  });

  it('returns the item net unchanged when the total is zero', () => {
    expect(apportionTaxableBase(0, 0, 100)).toBe(0);
  });

  it('reduces the base proportionally to the cart discount', () => {
    expect(apportionTaxableBase(500, 1000, 100)).toBe(450);
  });

  it('yields zero when the cart discount covers the whole total', () => {
    expect(apportionTaxableBase(500, 1000, 1000)).toBe(0);
  });

  it('rounds to whole minor units', () => {
    expect(apportionTaxableBase(333, 1000, 100)).toBe(300);
  });
});

describe('summarizeTaxBreakdown', () => {
  const line = (over: Partial<TaxLineBreakdown>): TaxLineBreakdown => ({
    taxRateId: 'r',
    name: 'R',
    ratePercent: 18,
    isInclusive: false,
    taxableBaseMinor: 1000,
    taxAmountMinor: 180,
    ...over,
  });

  it('returns zero totals for an empty breakdown', () => {
    expect(summarizeTaxBreakdown([])).toEqual({
      breakdown: [],
      totalTaxMinor: 0,
      exclusiveTaxMinor: 0,
      inclusiveTaxMinor: 0,
    });
  });

  it('splits inclusive and exclusive amounts', () => {
    const summary = summarizeTaxBreakdown([
      line({ taxRateId: 'a', taxAmountMinor: 180 }),
      line({ taxRateId: 'b', isInclusive: true, taxAmountMinor: 50 }),
    ]);
    expect(summary.exclusiveTaxMinor).toBe(180);
    expect(summary.inclusiveTaxMinor).toBe(50);
    expect(summary.totalTaxMinor).toBe(230);
  });
});
