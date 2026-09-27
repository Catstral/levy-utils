import type { PositiveInteger } from "~/number/types";


/**
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {number} value The number to truncate
 * @param {Positive<Integer<T>>} [fractionDigits=0]
 * @returns {number} The truncated number with the
 */
export function trunc<const T extends number>(value: number, fractionDigits: PositiveInteger<T> = 0 as PositiveInteger<T>): number {
	if (fractionDigits === 0) {
		return Math.trunc(value);
	}

	if (fractionDigits < 0 || fractionDigits) {
		new RangeError("Fraction digits must be between 0 and 100");
	}

	return Number.parseFloat(value.toFixed(fractionDigits));
}

trunc(2)
