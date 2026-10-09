import type { Promisable } from "~/types";

type MapResult<R> = [Extract<R, Promise<unknown>>] extends [never] ? R[] : Promisable<Awaited<R>[]>;

/**
 * Returns a new list of items based on mapped values of a given list.
 *
 * If the callback returns a promise for any item, a promise is returned that resolves once all of them have.
 * Whether the callback is async is only known once it has returned, so an empty list always returns a plain
 * array. Always `await` the result of a callback that can return a promise instead of chaining on it.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @template R
 * @param {readonly T[]} list The array to map values from
 * @param {(item: T, index: number, list: readonly T[]) => R} callback A mapper to convert the list items
 * @returns {MapResult<R>} A new array with mapped items from the given list, or a promise of it if the callback can
 * return a promise
 */
export function map<const T, const R>(
	list: readonly T[],
	callback: (item: T, index: number, list: readonly T[]) => R,
): MapResult<R>;
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
