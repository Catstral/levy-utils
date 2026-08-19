/**
 * Converts the first character of string to lowercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = capitalize("Hello World"); // -> "hello World"
 *
 * @template {string} T
 * @param {T} value
 * @returns {Uncapitalize<T>}
 */
export function uncapitalize<const T extends string>(value: T): Uncapitalize<T> {
	return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}` as Uncapitalize<T>;
}
