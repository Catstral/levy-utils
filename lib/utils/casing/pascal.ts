import { customCase } from "./custom";
import type { SplitCasingOptions } from "./internal";

/**
 * @typedef {Object} PascalCaseOptions
 */

export interface PascalCaseOptions extends SplitCasingOptions {}

/**
 * Converts a string to PascalCase.
 *
 * Every word has its first letter uppercased, with the rest of the word left untouched, and words are joined together
 * with no separator.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = pascalCase("hello world"); // -> "HelloWorld"
 *
 * @example
 * const str = pascalCase("hello-world_foo"); // -> "HelloWorldFoo"
 *
 * @example
 * // Acronyms keep their original casing, only their first letter is (re-)uppercased
 * const str = pascalCase("HTTP_server"); // -> "HTTPServer"
 *
 * @param {string} str The string to convert
 * @param {PascalCaseOptions} [options] The options used to convert the string (see {@link PascalCaseOptions} for more details)
 * @returns {string} The PascalCased string
 */
export function pascalCase(str: string, options?: PascalCaseOptions): string {
	return customCase(str, {
		...options,
		seperator: "",
		transform: (word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`,
	});
}
