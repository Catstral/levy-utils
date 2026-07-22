import { klona } from "klona";

/**
 * Clusters a list of items into a list of lists of items limited to a specified size.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @param {T[]} items The items to cluster
 * @param size The max size for each list
 * @returns {T[][]} An array of arrays with a max size of the specified size
 */
export function cluster<const T>(items: T[], size: number): T[][] {
	const cloned = klona(items);
	const clustered: T[][] = [[]];

	let index = 0;

	for (const item of cloned) {
		if (clustered[index].length <= size) {
			clustered[index].push(item);
		} else {
			index += 1;

			clustered[index] = [];
		}
	}

	return clustered;
}
