import type { IsNegative } from "../negative";

export type Sign<T extends number> = T extends 0 ? 0 : IsNegative<T> extends true ? -1 : 1

/**
 * Returns the sign of the given number.
 *
 * `NaN` is converted into zero.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {T} value The number to return the sign of
 * @returns {Sign<T>} A number indicating whether the given number is positive, negative or zero
 */
export function sign<const T extends number>(value: T): Sign<T> {
	if (Number.isNaN(value) || value === 0) {
		return 0 as Sign<T>;
	}

	return Math.sign(value) as Sign<T>;
}
