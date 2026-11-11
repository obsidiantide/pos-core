/**
 * Throws an Error with the given message unless `value` is a positive integer.
 */
export function assertPositiveInteger(value: number, message: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(message);
  }
}
