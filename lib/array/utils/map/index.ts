import type { Promisable } from "~/types";

/**
 * Returns a new list of items based on mapped values of a given list.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @template R
 * @param {readonly T[]} list The array to map values from
 * @param {(item: T, index: number, list: readonly T[]) => R} callback A mapper to convert the list items
 * @returns {Promisable<R[]>} A new array with mapped items from the given list
 */
export function map<const T, const R>(
	list: readonly T[],
	callback: (item: T, index: number, list: readonly T[]) => Promise<R>,
): Promise<R[]>;
export function map<const T, const R>(
	list: readonly T[],
	callback: (item: T, index: number, list: readonly T[]) => R,
): R[];
export function map(
	list: readonly unknown[],
	callback: (item: unknown, index: number, list: readonly unknown[]) => unknown,
): Promisable<unknown[]> {
	const result: unknown[] = [];

	let isPromise = false;

	for (const [index, value] of list.entries()) {
		const mapped = callback(value, index, list);

		result.push(mapped);

		if (!isPromise && mapped instanceof Promise) {
			isPromise = true;
		}
	}

	return isPromise ? Promise.all(result) : result;
}
