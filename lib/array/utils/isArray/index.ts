/**
 * Checks if the given item is an array.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check
 * @returns {boolean} A boolean to signal if the given item is an array
 */
export function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}
