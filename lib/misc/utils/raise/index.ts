/**
 * Throws the given value.
 *
 * If the given value is a string, it throws the value wrapped in an `Error`.
 * If the given value is a function, it calls the function without argument and throws its result.
 * If the given value is an error class with given arguments, it throws a new instance of that error constructed with those arguments.
 *
 * The time complexity for this is `O(1)`.
 *
 * @example
 * raise("Something went wrong");
 * raise(() => new RangeError("Out of range"));
 * raise(RangeError, "Out of range");
 *
 * @template {Error} T
 * @template {?[]} [Args=never[]]
 * @param {T} value The value to throw, a function that produces it, or an error class to construct
 * @param {...Args} args The value to throw, a function that produces it, or an error class to construct
 * @returns {never} Never returns, it always throws
 * @throws {?} A new instance of `value` if it is called with arguments, the result of calling `value` if it is a function, otherwise `value` itself
 */
export function raise<const T extends Error, const Args extends unknown[] = never[]>(
	value: new (...args: Args) => T,
	...args: Args
): never;
/**
 * Throws the given value.
 *
 * If the given value is a string, it throws the value wrapped in an `Error`.
 * If the given value is a function, it calls the function without argument and throws its result.
 * If the given value is an error class with given arguments, it throws a new instance of that error constructed with those arguments.
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
 * @throws {?} A new instance of `value` if it is called with arguments, the result of calling `value` if it is a function, otherwise `value` itself
 */
export function raise(value: unknown): never;
export function raise(value: unknown, ...args: unknown[]): never {
	switch (typeof value) {
		case "string": {
			throw new Error(value);
		}
		case "function": {
			throw args.length > 0 ? new (value as new (...args: unknown[]) => unknown)(...args) : value();
		}
		default: {
			throw value;
		}
	}
}
