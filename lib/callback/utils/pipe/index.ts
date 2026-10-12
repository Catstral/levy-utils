/**
 * Pipes a value into a callback and returns its result.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {?} T
 * @template {?} R
 * @param {T} value The initial value to be passed into the callback
 * @param {(value: T) => R} callback A function that accepts `value` and computes a result
 * @returns {R} The result of the `callback` function
 */
export function pipe<const T, const R>(value: T, callback: (value: T) => R): R {
	return callback(value);
}
