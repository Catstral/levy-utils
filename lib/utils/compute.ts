export type Computable<T, Args extends unknown[] = never[]> = T | ((...args: Args) => T);

/**
 * Check if a given value can be executed/computed.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template {?[]} Args
 * @param {Computable<T, Args>} value The values to check if it can be computed
 * @returns {boolean} A boolean to signal if the value can be computed
 */
export function isComputation<const T, const Args extends unknown[]>(
	value: Computable<T, Args>,
): value is (...args: Args) => T {
	return typeof value === "function";
}

/**
 * Computes a computable value.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template {unknown[]} [Args=never[]]
 * @param {Computable<T, Args>} value The value to compute
 * @param {Args} args The arguments needed to compute the value
 * @returns {T} A computed value
 */
export function compute<const T, const Args extends unknown[] = never[]>(value: Computable<T, Args>, ...args: Args): T {
	return isComputation(value) ? value(...args) : value;
}
