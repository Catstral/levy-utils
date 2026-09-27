import type { PositiveInteger } from "~/number/types";

/**
 * Truncates a number to the specified number of fraction digits.
 *
 * If no fraction digits are specified, the value is truncated to an integer.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {number} value The number to truncate
 * @param {PositiveInteger<T>} [fractionDigits=0]  The number of digits to preserve after the decimal point
 * @returns {number} The truncated number
 * @throws {RangeError} If `fractionDigits` is less than `0` or greater than `100`
 */
export function trunc(value: number): number;
export function trunc<const T extends number>(value: number, fractionDigits: PositiveInteger<T>): number;
export function trunc<const T extends number>(
	value: number,
	fractionDigits: PositiveInteger<T> = 0 as PositiveInteger<T>,
): number {
	if (fractionDigits === 0) {
		return Math.trunc(value);
	}

	if (fractionDigits < 0 || fractionDigits > 100) {
		throw new RangeError("Fraction digits must be between 0 and 100");
	}

	return Number.parseFloat(value.toFixed(fractionDigits));
}
