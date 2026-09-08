/**
 * Sums a list of items into a total number.
 *
 * If no mapper is specified, non-numeric values are converted to `1` if truthy and `0` if falsey.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {T[]} list The list of values to sum up
 * @param {(item: T) => number} mapper A callback to convert an item to be summable
 * @returns The sum of the list
 */
export function sum<const T>(list: T[], mapper?: (item: T) => number): number {
	let result = 0;

	if (mapper) {
		for (const value of list) {
			const mapped = mapper(value);

			if (Number.isNaN(mapped)) {
				continue;
			}

			result += mapped;
		}
	} else {
		for (const value of list) {
			if (typeof value === "number" && !Number.isNaN(value)) {
				result += value;

				continue;
			}

			result += value ? 1 : 0;
		}
	}

	return result;
}
