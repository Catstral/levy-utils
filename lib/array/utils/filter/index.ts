import type { Promisable } from "~/types";

type FilterResult<P, R> = [Extract<P, Promise<unknown>>] extends [never] ? R[] : Promisable<R[]>;

/**
 * Returns a new list containing the items of a given list that pass a predicate.
 *
 * If the predicate returns a promise for any item, a promise is returned that resolves once all of them have.
 * Whether the predicate is async is only known once it has returned, so an empty list always returns a plain
 * array. Always `await` the result of a predicate that can return a promise instead of chaining on it.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @template {T} R
 * @template P
 * @param {readonly T[]} list The array to filter values from
 * @param {(item: T, index: number, list: readonly T[]) => P} predicate A callback that returns whether an item is filtered
 * @returns {FilterResult<P, R>} A new list containing the filtered items, or a promise of it if the predicate can
 * return a promise
 */
export function filter<const T, const R extends T>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => item is R,
): R[];
export function filter<const T, const R extends T, P = unknown>(
	list: readonly T[],
	predicate: (item: T, index: number, list: readonly T[]) => P,
): FilterResult<P, R>;
export function filter(
	list: readonly unknown[],
	predicate: (item: unknown, index: number, list: readonly unknown[]) => Promisable<unknown>,
): Promisable<unknown[]> {
	const values: unknown[] = [];

	let entries: Promisable<[boolean, unknown]>[] = [];
	let isPromise = false;

	for (const [index, value] of list.entries()) {
		const result = predicate(value, index, list);

		if (result instanceof Promise) {
			if (!isPromise) {
				entries = values.map((value) => [true, value]);
				isPromise = true;

				values.length = 0;
			}

			entries.push(result.then((passed) => [!!passed, value]));
		} else if (isPromise) {
			entries.push([!!result, value]);
		} else if (result) {
			values.push(value);
		}
	}

	if (isPromise) {
		return Promise.all(entries).then((values) => {
			const result: unknown[] = [];

			for (const [passed, value] of values) {
				if (passed) {
					result.push(value);
				}
			}

			return result;
		});
	}

	return values;
}
