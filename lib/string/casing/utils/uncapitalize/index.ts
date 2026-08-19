/**
 * Converts the first character of string to lowercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = uncapitalize("Hello world"); // -> "hello world"
 *
 * @template {string} T
 * @param {T} str
 * @returns {Uncapitalize<T>}
 */
export function uncapitalize<const T extends string>(str: T): Uncapitalize<T> {
	return `${str.slice(0, 1).toLowerCase()}${str.slice(1)}` as Uncapitalize<T>;
}
