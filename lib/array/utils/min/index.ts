export interface MinOptions {
	/**
	 * The direction the list should be checked in.
	 *
	 * @default "ASCENDING"
	 */
	direction?: "ASCENDING" | "DESCENDING";
}

interface MinEntry {
	value: unknown;
	target: number;
}

/**
 * Returns the smallest item from a list.
 *
 * If no mapper is specified, non-numeric values within a list aren't compared.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {T[]} list The list to
 * @param {(item: T) => number} mapper A callback to convert an item to a number
 * @param {MinOptions} options Options to define how the smallest number is decided
 * @returns {T | undefined} The smallest item from a list
 */
export function min<const T extends number>(list: [T, ...T[]], mapper?: (item: T) => number, options?: MinOptions): T;
export function min<const T extends number>(
	list: T[],
	mapper?: (item: T) => number,
	options?: MinOptions,
): T | undefined;
export function min<const T>(list: [T, ...T[]], mapper: (item: T) => number, options?: MinOptions): T;
export function min<const T>(list: T[], mapper: (item: T) => number, options?: MinOptions): T | undefined;
export function min<const T>(list: T[], mapper?: (item: T) => number, options?: MinOptions): T | undefined {
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
		return list[reduceMethod]<MinEntry>(
			(acc, value) => {
				const mapped = mapper(value);

				if (mapped < acc.target) {
					return {
						value,
						target: mapped,
					};
				}

				return acc;
			},
			{
				value: initialValue,
				target: Infinity,
			},
		).value as T;
	}

	return list[reduceMethod]<MinEntry>(
		(acc, value) => {
			const target = typeof value === "number" ? value : Infinity;

			if (target < acc.target) {
				return {
					value,
					target,
				};
			}

			return acc;
		},
		{
			value: initialValue,
			target: Infinity,
		},
	).value as T;
}
