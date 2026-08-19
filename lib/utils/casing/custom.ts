import { type SplitCasingOptions, splitCasing } from "./internal";

/**
 * @typedef {Object} CustomCaseOptions
 * @prop {string} seperator The separator to place between each transformed word
 * @prop {(word: string, index: number) => string} transform A function used to transform each word found in the string
 */

export interface CustomCaseOptions extends SplitCasingOptions {
	/**
	 * The separator to place between each transformed word.
	 */
	seperator: string;
	/**
	 * A function used to transform each word found in the string. The word retains whatever casing it had in the
	 * original string.
	 *
	 * @param word The word to transform
	 * @param index The index of the word within the string
	 */
	transform: (word: string, index: number) => string;
}

/**
 * Splits a string into words (see {@link SplitCasingOptions}) and joins them back together using a custom separator,
 * transforming each word along the way.
 *
 * This is the building block used by the other casing utilities (`camelCase`, `kebabCase`, `pascalCase`, `snakeCase`,
 * `titleCase`, `httpHeaderCase`, etc.), That also means that those casing options should be used instead most of the time.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = customCase("hello world", { seperator: "-", transform: (word) => word.toUpperCase() }); // -> "HELLO-WORLD"
 *
 * @example
 * const str = customCase("hello world", { seperator: "_", transform: (word, index) => (index === 0 ? word : word.toUpperCase()) }); // -> "hello_WORLD"
 *
 * @param {string} str The string to transform
 * @param {CustomCaseOptions} options The options used to split and join the string (see {@link CustomCaseOptions} for more details)
 * @returns {string} The transformed string
 */
export function customCase(str: string, options: CustomCaseOptions): string {
	const words = splitCasing(str, options);
	const lastIndex = words.length - 1;

	return words.reduce<string>((acc, word, index) => {
		acc += options.transform(word, index);

		if (index !== lastIndex) {
			acc += options.seperator;
		}

		return acc;
	}, "");
}
