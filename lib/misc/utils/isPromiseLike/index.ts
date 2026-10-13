/**
 * Checks if the given value is promise-like.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is a promise
 * @returns {boolean} A boolean that signals if the given value is a promise
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
	return !!value && typeof value === "object" && "then" in value && typeof value.then === "function";
}
