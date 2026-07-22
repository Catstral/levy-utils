import type { Falsy } from "~/types";

/**
 * Turns a list of items into another list of items with all the falsy values filtered out of the list.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {(T | Falsy)[]} list The list to sift through
 * @returns {T[]} A new list with all the falsy values filtered out
 */
export function sift<const T>(list: (T | Falsy)[]): T[] {
	return list.filter((item): item is T => !!item);
}
