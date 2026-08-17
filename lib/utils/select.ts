/**
 * Returns a new list of items based on filtered and mapped values of a given list.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @template R
 * @param {T[] | readonly T[]} list The list to filter and map values through
 * @param {(item: T, index: number) => boolean} filter A callback to filter out values from the given list
 * @param {(item: T, index: number, originalIndex: number) => R} mapper A mapper to convert the filtered values
 * @returns {R[]} A new list with all filtered and mapped values
 */
export function select<const T, const V extends T, const R>(
	list: T[] | readonly T[],
	filter: (item: T, index: number) => item is V,
	mapper: (item: V, index: number) => R,
): R[];
export function select<const T, const R>(
	list: T[] | readonly T[],
	filter: (item: T, index: number) => boolean,
	mapper: (item: T, index: number, originalIndex: number) => R,
): R[];
export function select<const T, const R>(
	list: T[] | readonly T[],
	filter: (item: T, index: number) => boolean,
	mapper: (item: T, index: number, originalIndex: number) => R,
): R[] {
	const result: R[] = [];

	for (const [index, item] of list.entries()) {
		if (filter(item, index)) {
			const value = mapper(item, result.length, index);

			result.push(value);
		}
	}

	return result;
}
