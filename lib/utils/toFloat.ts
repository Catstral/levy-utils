/**
 * Turns a value into an float where invalid values, `NaN` or `Infinity` will return a fallback.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {number} T
 * @param {?} value The value to convert
 * @param {Integer<T>} [fallback = 0] A float number to fallback on when the value is invalid
 * @returns {number} A float number parsed from the value or a fallback
 */
export function toFloat(value: unknown, fallback: number = 0): number {
	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseFloat(value.toString());

			break;
		}
		case "string": {
			result = Number.parseFloat(value);

			break;
		}
		default: {
			return fallback;
		}
	}

	if (Number.isNaN(result) || !Number.isFinite(result)) {
		return fallback;
	}

	return result;
}
