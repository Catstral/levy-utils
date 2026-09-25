import type { Key } from "~/types";

/**
 * @private
 */
type Mask<T extends Record<Key, unknown>> = (Partial<T> & Record<Key, unknown>) | Record<Key, unknown>

export type Extend<T extends Record<Key, unknown>, U extends Mask<T>> = Omit<T, keyof U> & U;

/**
 * Extends an object with another object.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the amount of keys in `value`.
 * - `m` is the amount of keys in `other`.
 *
 * @template {Record<Key, unknown>} T
 * @template {Partial<T> & Record<Key, unknown>} U
 * @param {T} value The object to extend
 * @param {U} other The object to override or extend properties of `value` with
 * @returns {Extend<T, U>} An object where `value` is extesnded by `other`
 */
export function extend<const T extends Record<Key, unknown>, const U extends Mask<T>>(
	value: T,
	other: U,
): Extend<T, U> {
	const descriptors = Object.getOwnPropertyDescriptors(value);

	for (const key of Reflect.ownKeys(other)) {
		delete descriptors[key];
	}

	const result = Object.create(
		Object.getPrototypeOf(value),
		descriptors,
	);

	Object.defineProperties(result, Object.getOwnPropertyDescriptors(other));

	return result;
}
