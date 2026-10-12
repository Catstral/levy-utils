import { getCryptoSecureRandomNumber } from "~/random/helper";

/**
 * Returns a random item from a given array or `undefined` if the array length is 0.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @param {T[]} list The array to pick a random item from
 * @returns {T | undefined} The random item
 */
export function draw<T>(list: [T, ...T[]]): T;
export function draw<T>(list: T[]): T | undefined;
export function draw<T>(list: readonly [T, ...T[]]): T;
export function draw<T>(list: readonly T[]): T | undefined;
export function draw(list: readonly unknown[]): unknown {
	if (list.length === 0) {
		return undefined;
	}

	return list[getCryptoSecureRandomNumber(list.length)];
}
