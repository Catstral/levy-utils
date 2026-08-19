/**
 * Converts the first character of string to uppercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = capitalize("hello world"); // -> "Hello world"
 *
 * @template {string} T
 * @param {T} value
 * @returns {Capitalize<T>}
 */
export function capitalize<const T extends string>(value: T): Capitalize<T> {
	return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}` as Capitalize<T>;
}
