import { customCase } from "./custom";
import type { SplitCasingOptions } from "./internal";

/**
 * @typedef {Object} CamelCaseOptions
 */

export interface CamelCaseOptions extends SplitCasingOptions {}

/**
 * Converts a string to camelCase.
 *
 * The first word is lowercased, every following word has its first letter uppercased with the rest lowercased, and
 * words are joined together with no separator.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = camelCase("hello world"); // -> "helloWorld"
 *
 * @example
 * const str = camelCase("Hello-World_foo"); // -> "helloWorldFoo"
 *
 * @param {string} str The string to convert
 * @param {CamelCaseOptions} [options] The options used to convert the string (see {@link CamelCaseOptions} for more details)
 * @returns {string} The camelCased string
 */
export function camelCase(str: string, options?: CamelCaseOptions): string {
	return customCase(str, {
		...options,
		seperator: "",
		transform: (word, index) => {
			if (index === 0) {
				return word.toLowerCase();
			}

			return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
		},
	});
}
