/**
 * Checks if the given value is a promise.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is a promise
 * @returns {boolean} A boolean that signals if the given value is a promise
 */
export function isPromise(value: unknown): value is Promise<unknown> {
	return value instanceof Promise;
}
