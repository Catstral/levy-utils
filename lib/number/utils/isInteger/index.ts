import type { Integer } from "~/number";

export type IsInteger<T extends number> = T extends Integer<T> ? true : false;

/**
 * Checks if the given value is an integer.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} value The number to check if it is an integer
 * @returns {boolean} A boolean that signals if the given number is an integer
 */
export function isInteger<const T extends number>(value: T): IsInteger<T>;
export function isInteger<const T extends number>(value: T): boolean {
	return Number.isInteger(value);
}
