/**
 * Returns the modulo of a dividend and a divisor.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} dividend The number to be divided
 * @param {number} divisor The number to divide by
 * @returns {number} The modulo of the division
 */
export function mod(dividend: number, divisor: number): number {
	return ((dividend % divisor) + divisor) % divisor || 0;
}
