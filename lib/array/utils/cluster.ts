import { UtilError } from "~/index";

export class ClusterUtilError extends UtilError {
	public readonly util = "cluster";
}

/**
 * Clusters a list of items into a list of lists of items limited to a specified size.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the given list.
 *
 * @template T
 * @param {T[]} items The items to cluster
 * @param size The max size for each list
 * @returns {T[][]} An array of arrays with a max size of the specified size
 * @throws {ClusterUtilError} If the cluster size is less then 1
 * @throws {ClusterUtilError} If the given items are not an array
 */
export function cluster<const T>(items: T[], size: number): T[][] {
	if (size < 1) {
		throw new ClusterUtilError("Cluster size cannot be smaller than 1");
	}

	if (!Array.isArray(items)) {
		throw new ClusterUtilError("Items must be an array");
	}

	const clustered: T[][] = [[]];

	let index = 0;

	for (const item of items) {
		if (clustered[index].length < size) {
			clustered[index].push(item);
		} else {
			index += 1;

			clustered[index] = [item];
		}
	}

	return clustered;
}
