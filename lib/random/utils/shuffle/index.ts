import { UtilError } from "~/error";
import { getCryptoSecureRandomNumber } from "~/random/helper";

export class ShuffleUtilError extends UtilError {
	public readonly util = "shuffle";
}

/**
 * Returns a new Array from a given array, with every item moved to a random position.
 *
 * The time complexity for this is `O(2n)` where `n` is the amount of values in the list.
 *
 * @template T
 * @param {T[]} array The array to shuffle
 * @returns {T[]} The shuffled array
 */
export function shuffle<const T>(array: T[]): T[];
export function shuffle<const T>(array: readonly T[]): T[];
export function shuffle<const T>(array: readonly T[]): T[] {
	const cloned = [...array];

	for (let index = cloned.length - 1; index !== 1; index -= 1) {
		const swapIndex = getCryptoSecureRandomNumber(index, ShuffleUtilError);

		[cloned[swapIndex], cloned[index]] = [cloned[index], cloned[swapIndex]];
	}

	return cloned;
}
