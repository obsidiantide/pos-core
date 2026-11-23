export interface TaxRate {
  id: string;
  name: string;
  /** Tax percentage (e.g. 18 for 18%) */
  ratePercent: number;
  /** Whether the tax is already included in the item retail price */
  isInclusive?: boolean;
}

export interface TaxLineBreakdown {
  taxRateId: string;
  name: string;
  ratePercent: number;
  isInclusive: boolean;
  taxableBaseMinor: number;
  taxAmountMinor: number;
}

export interface TaxSummary {
  breakdown: TaxLineBreakdown[];
  totalTaxMinor: number;
  exclusiveTaxMinor: number;
  inclusiveTaxMinor: number;
}

/**
 * Calculates the tax amount in minor units for a given base amount and rate percentage.
 *
 * @param baseAmountMinor Base amount in minor units (e.g. cents, qəpik)
 * @param ratePercent Tax rate percentage (e.g. 18 for 18%)
 * @param isInclusive Whether the base amount already includes tax
 * @returns Calculated tax amount in minor units
 */
export function calculateTaxAmount(
  baseAmountMinor: number,
  ratePercent: number,
  isInclusive = false
): number {
  if (baseAmountMinor <= 0 || ratePercent <= 0) {
    return 0;
  }

  if (isInclusive) {
    // Formula: gross - (gross / (1 + rate / 100)) = (gross * rate) / (100 + rate)
    return Math.round((baseAmountMinor * ratePercent) / (100 + ratePercent));
  }

  // Exclusive formula: net * (rate / 100)
  return Math.round((baseAmountMinor * ratePercent) / 100);
}

/**
 * Reduces an item's net amount (after item-level discounts) by its proportional
 * share of the cart-level discount, giving the base on which tax is calculated.
 *
 * @param itemNetMinor Item net amount after item-level discounts
 * @param totalNetMinor Sum of all item net amounts after item-level discounts
 * @param cartDiscountMinor Total cart-level discount to apportion
 */
export function apportionTaxableBase(
  itemNetMinor: number,
  totalNetMinor: number,
  cartDiscountMinor: number
): number {
  if (totalNetMinor <= 0 || cartDiscountMinor <= 0) {
    return itemNetMinor;
  }
  const ratio = (totalNetMinor - cartDiscountMinor) / totalNetMinor;
  return Math.round(itemNetMinor * ratio);
}

/**
 * Aggregates per-rate tax lines into a summary with inclusive/exclusive totals.
 */
export function summarizeTaxBreakdown(breakdown: TaxLineBreakdown[]): TaxSummary {
  let totalTaxMinor = 0;
  let exclusiveTaxMinor = 0;
  let inclusiveTaxMinor = 0;

  for (const line of breakdown) {
    totalTaxMinor += line.taxAmountMinor;
    if (line.isInclusive) {
      inclusiveTaxMinor += line.taxAmountMinor;
    } else {
      exclusiveTaxMinor += line.taxAmountMinor;
    }
  }

  return { breakdown, totalTaxMinor, exclusiveTaxMinor, inclusiveTaxMinor };
}
