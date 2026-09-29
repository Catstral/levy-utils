export type IsDecimal<T extends number> = number extends T
	? boolean
	: `${T}` extends `${string}.${string}`
		? true
		: false;

/**
 * Checks if the given value is a number with decimals.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} value The number to check if it has decimals
 * @returns {boolean} A boolean that signals if the given number has decimals
 */
export function isDecimal<const T extends number>(value: T): IsDecimal<T>;
export function isDecimal<const T extends number>(value: T): boolean {
	if (Number.isNaN(value) || !Number.isFinite(value)) {
		return false;
	}

	return !Number.isInteger(value);
}
