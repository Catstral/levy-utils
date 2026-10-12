/**
 * Throws the given value.
 *
 * If the given value is a string, it throws the value wrapped in an `Error`.
 * If the given value is a function, it calls the function without argument and throws its result.
 *
 * The time complexity for this is `O(1)`.
 *
 * @example
 * raise("Something went wrong");
 * raise(() => new RangeError("Out of range"));
 * raise(RangeError, "Out of range");
 *
 * @param {?} value The value to throw, a function that produces it, or an error class to construct
 * @returns {never} Never returns, it always throws
 * @throws {Error} If the given `value` is a string
 * @throws {?} The given value
 */
export function raise(value: unknown): never {
	switch (typeof value) {
		case "string": {
			throw new Error(value);
		}
		case "function": {
			throw value();
		}
		default: {
			throw value;
		}
	}
}
