export interface MaxOptions {
	/**
	 * The direction the list should be checked in.
	 *
	 * @default "ASCENDING"
	 */
	direction?: "ASCENDING" | "DESCENDING";
}

interface MaxEntry {
	value: unknown;
	target: number;
}

/**
 * Returns the largest item from a list.
 *
 * If no mapper is specified, non-numeric values within a list aren't compared.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {T[]} list The list to
 * @param {(item: T) => number} mapper A callback to convert an item to a number
 * @param {MaxOptions} options Options to define how the largest number is decided
 * @returns {T | undefined} The smallest item from a list
 */
export function max<const T>(list: [T, ...T[]], mapper?: (item: T) => number, options?: MaxOptions): T;
export function max<const T>(list: T[], mapper?: (item: T) => number, options?: MaxOptions): T | undefined;
export function max<const T>(list: T[], mapper?: (item: T) => number, options?: MaxOptions): T | undefined {
	if (list.length === 0) {
		return undefined;
	}

	const direction = options?.direction ?? "ASCENDING";
	const initialValue = list.at(direction === "DESCENDING" ? -1 : 0) as T;

	if (list.length === 1) {
		return initialValue;
	}

	const reduceMethod: "reduce" | "reduceRight" = direction === "DESCENDING" ? "reduceRight" : "reduce";

	if (mapper) {
		return list[reduceMethod]<MaxEntry>(
			(acc, value) => {
				const mapped = mapper(value);

				if (mapped > acc.target) {
					return {
						value,
						target: mapped,
					};
				}

				return acc;
			},
			{
				value: initialValue,
				target: -Infinity,
			},
		).value as T | undefined;
	}

	return list[reduceMethod]<MaxEntry>(
		(acc, value) => {
			const target = typeof value === "number" ? value : -Infinity;

			if (target > acc.target) {
				return {
					value,
					target,
				};
			}

			return acc;
		},
		{
			value: initialValue,
			target: -Infinity,
		},
	).value as T | undefined;
}
