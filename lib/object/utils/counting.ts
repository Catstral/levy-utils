import type { Key } from "~/index";

/**
 * Reduces a list down to an object of keys (specified using the `identity` param)
 * with a number of how many times that identity has been seen.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @template {Key} V
 * @param {T} list The list to count
 * @param {(item: T) => V} identity A function to identify what value to count
 * @returns {Partial<Record<V, number>>} A keyed object with how many times that key showed up.
 * Do note that the keys that didn't show up are not on this object
 */
export function counting<const T, const V extends Key>(
	list: T[],
	identity: (item: T) => V,
): Partial<Record<V, number>> {
	const counts: Partial<Record<V, number>> = {};

	for (const item of list) {
		const key = identity(item);

		counts[key] = (counts[key] ?? 0) + 1;
	}

	return counts;
}
