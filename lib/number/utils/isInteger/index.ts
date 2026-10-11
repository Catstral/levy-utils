import type { IsInteger } from "~/number";

/**
 * Checks if the given value is an integer.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {T} value The number to check if it is an integer
 * @returns {IsInteger<T>} A boolean that signals if the given number is an integer
 */
export function isInteger<const T extends number>(value: T): IsInteger<T> {
	return Number.isInteger(value) as IsInteger<T>;
}
