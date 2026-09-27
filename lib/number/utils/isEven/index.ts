/**
 * Checks if the given value is an even number.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} value The value to check if it is an even number
 * @returns {boolean} A boolean that signals if the given number is even
 */
export function isEven(value: number): boolean {
	return ((value % 2) + 2) % 2 === 0;
}
