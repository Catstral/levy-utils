/**
 * Checks if the given value is an odd number.
 *
 * @param {number} value The value to check if it is an odd number
 * @returns {boolean} A boolean that signals if the given number is odd
 */
export function isOdd(value: number): boolean {
	return ((value % 2) + 2) % 2 === 1;
}
