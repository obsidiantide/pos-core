import { assertNonNegativeInteger, assertPositiveInteger } from './validation.js';

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  /** Percentage (0-100) or fixed amount in minor units */
  value: number;
  /** Optional item id if this discount applies only to a specific item */
  targetItemId?: string;
  /** Optional cap on the total discount in minor units */
  maxDiscountMinor?: number;
}

/**
 * Calculates the discount amount in minor units for a given base amount.
 */
export function calculateDiscountAmount(
  baseAmountMinor: number,
  discount: Discount
): number {
  if (baseAmountMinor <= 0 || discount.value <= 0) {
    return 0;
  }

  let calculated = 0;

  if (discount.type === 'percentage') {
    calculated = Math.round((baseAmountMinor * discount.value) / 100);
    if (discount.maxDiscountMinor !== undefined && discount.maxDiscountMinor >= 0) {
      calculated = Math.min(calculated, discount.maxDiscountMinor);
    }
  } else if (discount.type === 'fixed') {
    calculated = Math.round(discount.value);
  }

  return Math.min(baseAmountMinor, Math.max(0, calculated));
}

/**
 * Calculates a "buy X, get Y free" discount in minor units.
 *
 * Items are grouped into bundles of `buyQty + getQty`; every complete bundle
 * makes `getQty` units free. A trailing partial bundle only gets free units
 * once the `buyQty` paid units are covered (e.g. buy 2 get 1: 5 units -> 1 free,
 * 3 units -> 1 free, 2 units -> 0 free).
 */
export function calculateBuyXGetYDiscount(
  unitPriceMinor: number,
  quantity: number,
  buyQty: number,
  getQty: number
): number {
  assertNonNegativeInteger(unitPriceMinor, 'Unit price must be a non-negative integer in minor units');
  assertNonNegativeInteger(quantity, 'Quantity must be a non-negative integer');
  assertPositiveInteger(buyQty, 'Buy quantity must be a positive integer');
  assertPositiveInteger(getQty, 'Get quantity must be a positive integer');

  const bundleSize = buyQty + getQty;
  const fullBundles = Math.floor(quantity / bundleSize);
  const remainder = quantity % bundleSize;
  const freeInRemainder = Math.max(0, remainder - buyQty);
  return (fullBundles * getQty + freeInRemainder) * unitPriceMinor;
}
