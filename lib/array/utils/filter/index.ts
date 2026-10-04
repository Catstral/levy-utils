import type { Promisable } from "~/types";

/**
 * Returns a new list of items based on mapped values of a given list.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @template {T} R
 * @param {readonly T[]} list The array to filter values from
 * @param {(item: T, index: number, list: readonly T[]) => Promisable<unknown>} predicate A callback that returns whether an item is filtered
 * @returns {Promisable<R[]>} A new list containing the filtered items
 */
export function filter<const T, const R extends T>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => item is R,
): R[];
export function filter<const T, const R extends T>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => Promise<unknown>,
): Promise<R[]>;
export function filter<const T, const R extends T>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => unknown,
): R[];
export function filter<const T, const R extends T>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => Promisable<unknown>,
): Promisable<R[]> {
	const values: R[] = [];

	let entries: Promisable<[boolean, T]>[] = [];
	let isPromise = false;

	for (const [index, value] of list.entries()) {
		const result = predicate(value, index, list);

		if (isPromise) {
			if (result instanceof Promise) {
				entries.push(result.then((passed) => [!!passed, value]));
			} else {
				entries.push([!!result, value]);
			}

			continue;
		}

		if (result instanceof Promise) {
			entries = values.map((value) => [true, value] as [boolean, T]);
			isPromise = true;

			values.length = 0;
		} else if (result) {
			values.push(value as R);
		}
	}

	if (isPromise) {
		return Promise.all(entries).then((values) => {
			const result: R[] = [];

			for (const [passed, value] of values) {
				if (passed) {
					result.push(value as R);
				}
			}

			return result;
		});
	}

	return values;
}
