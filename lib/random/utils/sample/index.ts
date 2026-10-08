import { getCryptoSecureRandomNumber } from "~/random/helper";

/**
 * Returns a random item from a given array or `undefined` if the array length is 0.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @param {T[]} array The array to pick a random item from
 * @returns {T | undefined} The random item
 */
export function sample<T>(array: [T, ...T[]]): T;
export function sample<T>(array: T[]): T | undefined;
export function sample<T>(array: readonly [T, ...T[]]): T;
export function sample<T>(array: readonly T[]): T | undefined;
export function sample(array: readonly unknown[]): unknown {
	if (array.length === 0) {
		return undefined;
	}

	return array[getCryptoSecureRandomNumber(array.length)];
}
