/**
 * Converts a string to UPPERCASE.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = upperCase("Hello World"); // -> "HELLO WORLD"
 *
 * @template {string} T
 * @param {T} value
 * @returns {Uppercase<T>}
 */
export function upperCase<const T extends string>(value: T): Uppercase<T> {
	return value.toUpperCase() as Uppercase<T>;
}
