/**
 * Checks if the given value is nullish.
 *
 * The following types are considered nullish:
 * - `null`
 * - `undefined`
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is nullish
 * @returns {boolean} A boolean that signals if the given value is nullish
 */
export function isNullish(value: unknown): value is undefined | null {
	return value == null;
}
