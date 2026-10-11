export type IsDecimal<T extends number> = number extends T
	? boolean
	: `${T}` extends `${number}.${number}`
		? true
		: false;

/**
 * Checks if the given value is a number with decimals.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {T} value The number to check if it has decimals
 * @returns {IsDecimal<T>} A boolean that signals if the given number has decimals
 */
export function isDecimal<const T extends number>(value: T): IsDecimal<T> {
	if (Number.isNaN(value) || !Number.isFinite(value)) {
		return false;
	}

	return !Number.isInteger(value) as IsDecimal<T>;
}
