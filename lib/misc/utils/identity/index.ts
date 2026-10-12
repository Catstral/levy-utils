/**
 * Returns the given value.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @param T The value to return
 * @returns {T} The given value
 */
export function identity<const T>(value: T): T {
	return value;
}
