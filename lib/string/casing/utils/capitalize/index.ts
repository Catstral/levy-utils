/**
 * Converts the first character of string to uppercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = capitalize("hello world"); // -> "Hello world"
 *
 * @template {string} T
 * @param {T} str
 * @returns {Capitalize<T>}
 */
export function capitalize<const T extends string>(str: T): Capitalize<T> {
	return `${str.slice(0, 1).toUpperCase()}${str.slice(1)}` as Capitalize<T>;
}
