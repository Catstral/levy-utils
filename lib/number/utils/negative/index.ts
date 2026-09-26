export type Negative<T extends number> = T extends 0 ? -0 : `-${T}` extends `${infer N extends number}`
	? N
	: T;
export type IsNegative<T extends number> = T extends Negative<T> ? true : false

/**
 * Converts a number into a negative number.
 *
 * `-0` is returned if the given value is `NaN`.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {Negative<T>} value The value to convert into a negative number
 * @returns {Negative<T>} A negative number
 */
export function negative<const T extends number>(value: T): Negative<T> {
	return (Number.isNaN(value) ? -0 : -Math.abs(value)) as Negative<T>
}

/**
 * Checks if the given value is a negative number.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} value The value to check if it is a negative number
 * @returns {boolean} A boolean that signals if the given number is negative
 */
export function isNegative<const T extends number>(value: T): IsNegative<T>
export function isNegative<const T extends number>(value: T): boolean {
	return value < 0 || Object.is(value, -0);
}
