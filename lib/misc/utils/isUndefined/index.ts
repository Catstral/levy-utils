/**
 * Checks if the given value is undefined.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is undefined
 * @returns {boolean} A boolean that signals if the given value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}
