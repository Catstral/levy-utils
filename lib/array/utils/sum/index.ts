/**
 * Sums a list of items into a total number.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {T[]} values The list of values to sum up
 * @param {(item: T) => number} mapper A callback to convert an item to be summable
 * @returns The sum of the list
 */
export function sum<const T>(values: T[], mapper?: (item: T) => number): number {
	let result = 0;

	if (mapper) {
		for (const value of values) {
			const mapped = mapper(value);

			if (Number.isNaN(mapped)) {
				continue;
			}

			result += mapped;
		}
	} else {
		for (const value of values) {
			if (typeof value !== "number" || Number.isNaN(value)) {
				continue;
			}

			result += value;
		}
	}

	return result;
}
