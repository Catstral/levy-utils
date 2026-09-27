/**
 * Returns the sign of the given number.
 *
 * `NaN` is converted into zero.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param value The number to return the sign of
 * @returns A number indicating whether the given number is positive, negative or zero
 */
export function sign(value: number): -1 | 0 | 1 {
	if (Number.isNaN(value)) {
		return 0;
	}

	return Math.sign(value) as -1 | 0 | 1;
}
