export type Integer<T extends number> = `${T}` extends `${string}.${string}` ? never : T;

/**
 * Turns a value into an integer where invalid values, `NaN` or `Infinity` will return a fallback.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {?} value The value to convert
 * @param {Integer<T>} [fallback = 0] An integer to fallback on when the value is invalid
 * @returns {number} An integer number parsed from the value or a fallback
 */
export function toInt<const T extends number>(value: unknown, fallback: Integer<T> = 0 as Integer<T>): number {
	const integerFallback = Math.trunc(fallback);

	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseInt(value.toString(), 10);

			break;
		}
		case "string": {
			result = Number.parseInt(value, 10);

			break;
		}
		default: {
			return integerFallback;
		}
	}

	if (Number.isNaN(result) || !Number.isFinite(result)) {
		return integerFallback;
	}

	return result;
}
