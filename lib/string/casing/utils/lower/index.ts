/**
 * Converts a string to lowercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = lowerCase("Hello World"); // -> "hello world"
 *
 * @template {string} T
 * @param {T} str
 * @returns {Lowercase<T>}
 */
export function lowerCase<const T extends string>(str: T): Lowercase<T> {
	return str.toLowerCase() as Lowercase<T>;
}
