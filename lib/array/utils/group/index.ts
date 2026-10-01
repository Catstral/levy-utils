import type { Key } from "~/types";

/**
 * Reduces a list down to an object of keys specified by the given `identity` callback.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @template {Key} K
 * @param {T} list The list to count
 * @param {(item: T) => K} identity A function to identify what value to count
 * @returns {Partial<Record<K, T[]>>} A keyed object with how many times that key showed up.
 * Do note that the keys that didn't show up are not on this object
 */
export function group<const T, const K extends Key = Key>(
	list: T[],
	identity: (item: T) => K,
): Partial<Record<K, T[]>> {
	const grouped: Partial<Record<K, T[]>> = {};

	for (const item of list) {
		const key = identity(item);

		grouped[key] ??= [];
		grouped[key].push(item);
	}

	return grouped;
}
