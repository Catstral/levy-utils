import { customCase } from "./custom";
import type { SplitCasingOptions } from "./internal";

/**
 * @typedef {Object} TitleCaseOptions
 */

export interface TitleCaseOptions extends SplitCasingOptions {}

/**
 * Converts a string to Title Case.
 *
 * Every word has its first letter uppercased, with the rest of the word left untouched, and words are joined together
 * using a single space.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = titleCase("hello world"); // -> "Hello World"
 *
 * @example
 * const str = titleCase("hello-world_foo"); // -> "Hello World Foo"
 *
 * @param {string} str The string to convert
 * @param {TitleCaseOptions} [options] The options used to convert the string (see {@link TitleCaseOptions} for more details)
 * @returns {string} The Title Cased string
 */
export function titleCase(str: string, options?: TitleCaseOptions): string {
	return customCase(str, {
		...options,
		seperator: " ",
		transform: (word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`,
	});
}
