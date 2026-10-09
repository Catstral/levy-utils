import { getCryptoSecureRandomNumber } from "~/random/helper";

export interface ScatterOptions {
	/**
	 * The bias of the split.
	 *
	 * @default "ROUND"
	 */
	bias?: "FLOOR" | "ROUND" | "CEIL";
}

/**
 * Returns an array split into a specified percentage of the original length with the original values
 * assigned to either side at random.
 *
 * The time complexity of this is `O(n + n**2)` where `n` is the amount of items in the list.
 *
 * *NOTE: The time complexity of this is `O(n)` if the split is outside the specified range.*
 *
 * @template T
 * @param {T[]} list The list to scatter
 * @param {number} [split=0.5] The percentage to split the array into (scale: 0 - 1)
 * @param {ScatterOptions} [options] The options given to scatter the array
 * @returns {[T[], T[]]} A split of the original array
 */
export function scatter<const T>(list: T[], split?: number, options?: ScatterOptions): [T[], T[]];
export function scatter<const T>(list: readonly T[], split?: number, options?: ScatterOptions): [T[], T[]];
export function scatter<const T>(list: readonly T[], split: number = 0.5, options?: ScatterOptions): [T[], T[]] {
	const cloned = [...list];

	if (split >= 1) {
		return [cloned, []];
	}

	if (split <= 0) {
		return [[], cloned];
	}

	let largeSize: number;

	const bias = options?.bias ?? "ROUND";

	switch (bias) {
		case "FLOOR": {
			largeSize = Math.floor(list.length * split);

			break;
		}
		case "ROUND": {
			largeSize = Math.round(list.length * split);

			break;
		}
		case "CEIL": {
			largeSize = Math.ceil(list.length * split);

			break;
		}
	}

	const output: [T[], T[]] = [[], []];

	for (let index = 0; index < largeSize; index += 1) {
		output[0].push(...cloned.splice(getCryptoSecureRandomNumber(cloned.length), 1));
	}

	output[1] = cloned;

	return output;
}
