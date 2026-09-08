import type { Key } from "~/types";

export type Extend<T extends Record<Key, unknown>, U extends Partial<T> | Record<Key, unknown>> = Omit<T, keyof U> & U;

/**
 * Extends an object with another object.
 *
 * The time complexity for this is `O(n * m)` where `n` is the amount of keys in `other`.
 *
 * @template {Record<Key, unknown>} T
 * @template {Partial<T> & Record<Key, unknown>} U
 * @param {T} value The object to extend
 * @param {U} other The object to override or extend properties of `value` with
 * @returns {Extend<T, U>} An object where `value` is extended by `other`
 */
export function extend<const T extends Record<Key, unknown>, const U extends Partial<T> | Record<Key, unknown>>(
	value: T,
	other: U,
): Extend<T, U> {
	const result: Extend<T, U> = Object.create(Object.getPrototypeOf(value), Object.getOwnPropertyDescriptors(value));

	Object.defineProperties(result, Object.getOwnPropertyDescriptors(other));

	return result;
}
