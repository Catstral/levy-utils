export type Positive<T extends number> = `${T}` extends `-${infer V extends number}` ? V : T
export type IsPositive<T extends number> = T extends Positive<T> ? true : false

/**
 * Converts a number into a positive number.
 *
 * `0` is returned if the given value is `NaN`.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {Positive<T>} value The value to convert into a positive number
 * @returns {Positive<T>} A positive number
 */
export function positive<const T extends number>(value: T): Positive<T> {
	return (Number.isNaN(value) ? 0 : Math.abs(value)) as Positive<T>
}

/**
 * Checks if the given value is a positive number.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} value The value to check if it is a positive number
 * @returns {boolean} A boolean that signals if the given number is positive
 */
export function isPositive<const T extends number>(value: T): IsPositive<T>
export function isPositive<const T extends number>(value: T): boolean {
	return value > 0 || Object.is(value, 0);
}
