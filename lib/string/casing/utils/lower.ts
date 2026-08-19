/**
 * Converts a string to lowercase.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = lowerCase("Hello World"); // -> "hello world"
 *
 * @template {string} T
 * @param {T} value
 * @returns {Lowercase<T>}
 */
export function lowerCase<const T extends string>(value: T): Lowercase<T> {
	return value.toLowerCase() as Lowercase<T>;
}
