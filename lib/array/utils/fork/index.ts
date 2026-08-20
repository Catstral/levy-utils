/**
 * Returns a tuple of 2 arrays that are constructed from a single list based on a condition given.
 * The first item in the tuple is all the items in the list that pass the specified condition,
 * the second item in the tuple is all the items in the last that did not pass the specified condition.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @param {T[]} list The given list to fork
 * @param {(item: T) => boolean} condition A callback to compute the condition for each item in the list
 * @returns {[T[], T[]]} A tuple of 2 lists of items split based on the specified condition
 */
export function fork<const T, const V extends T>(list: T[], condition: (item: T) => item is V): [V[], Exclude<T, V>[]];
export function fork<const T>(list: T[], condition: (item: T) => boolean): [T[], T[]];
export function fork<const T>(list: T[], condition: (item: T) => boolean): [T[], T[]] {
	const lists: [T[], T[]] = [[], []];

	for (const item of list) {
		const index = condition(item) ? 0 : 1;

		lists[index].push(item);
	}

	return lists;
}
