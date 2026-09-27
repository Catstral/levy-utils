export type IsDecimal<T extends number> = `${T}` extends `${string}.${string}` ? true : false;

/**
 * Checks if the given value is a number with decimals.
 *
 * @param value The number to check if it has decimals
 * @returns A boolean that signals if the given number has decimals
 */
export function isDecimal<const T extends number>(value: T): IsDecimal<T>;
export function isDecimal<const T extends number>(value: T): boolean {
	if (Number.isNaN(value) || !Number.isFinite(value)) {
		return false;
	}

	return !Number.isInteger(value);
}
