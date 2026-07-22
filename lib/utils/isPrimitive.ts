export type Primitive = string | number | boolean | symbol | null | undefined;

/**
 * Checks if the given value is a primitve value.
 *
 * The following types are considered primitive:
 * - string
 * - number
 * - boolean
 * - null
 * - undefined
 * - symbol
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is primitive
 * @returns {boolean} A boolean that signals if the given value is a primitive
 */
export function isPrimitive(value: unknown): value is Primitive {
	if (value === null) {
		return true;
	}

	switch (typeof value) {
		case "boolean":
		case "number":
		case "string":
		case "symbol":
		case "undefined": {
			return true;
		}
		default: {
			return false;
		}
	}
}
