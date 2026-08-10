export type splitCasingParser = (str: string) => string[];

/**
 * @typedef {Object} SplitCasingOptions
 * @prop {boolean} [splitOnNumbers] Whether a run of digits should be split off into its own word, or seen as normal characters of the same word
 * @prop {boolean} [groupUppercaseLetters] Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time
 * @prop {splitCasingParser} [parser] A custom parser to parse a given string into word that are then used for changing the casing of words
 */

export interface SplitCasingOptions {
	/**
	 * Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
	 *
	 * @default false
	 */
	groupNumbers?: boolean;
	/**
	 * Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
	 *
	 * @default true
	 */
	groupUppercaseLetters?: boolean;
	/**
	 * A custom parser to parse a given string into word that are then used for changing the casing of words.
	 *
	 * If this is defined, all other options are ignored.
	 */
	parser?: splitCasingParser;
}

/**
 * Splits a string into its constituent words, based on whitespace, hyphens, underscores, casing changes, and
 * (optionally) runs of digits. The original casing of each word is preserved as-is.
 *
 * This is an internal building block used by the casing utilities in this directory (see {@link CustomCaseOptions})
 * and is not intended to be used directly.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const words = splitCasing("helloWorld", undefined); // -> ["hello", "World"]
 *
 * @example
 * const words = splitCasing("HTTPServer", undefined); // -> ["HTTPServer"]
 *
 * @example
 * const words = splitCasing("HTTPServer", { groupUppercaseLetters: false }); // -> ["H", "T", "T", "P", "Server"]
 *
 * @example
 * const words = splitCasing("HTTP_server", undefined); // -> ["HTTP", "server"]
 *
 * @example
 * const words = splitCasing("foo123bar", { groupNumbers: true }); // -> ["foo", "123", "bar"]
 *
 * @example
 * const words = splitCasing("foo_bar-baz qux", undefined); // -> ["foo", "bar", "baz", "qux"]
 *
 * @param {string} str The string to split into words
 * @param {SplitCasingOptions | undefined} options The options used to split the string (see {@link SplitCasingOptions} for more details)
 * @returns {string[]} The words found in the given string, with their original casing preserved
 */
export function splitCasing(str: string, options?: SplitCasingOptions): string[] {
	if (options?.parser) {
		return options.parser(str);
	}

	const groupNumbers = options?.groupNumbers ?? false;
	const groupUppercase = options?.groupUppercaseLetters ?? true;
	const words: string[] = [];

	const uppercaseTest = /[A-Z]/;
	const numberTest = /[0-9]/;
	const whitespaceTest = /[\s-_]/;

	let currentWord = "";

	const finishCurrentWord = () => {
		words.push(currentWord);

		currentWord = "";
	};

	for (const char of str.trim()) {
		const prevChar = currentWord.at(-1);

		if (prevChar === undefined) {
			if (whitespaceTest.test(char)) {
				continue;
			}

			currentWord += char;

			continue;
		}

		if (whitespaceTest.test(char)) {
			finishCurrentWord();

			continue;
		}

		if (groupNumbers) {
			if (numberTest.test(char)) {
				if (numberTest.test(prevChar)) {
					currentWord += char;

					continue;
				}

				finishCurrentWord();
				currentWord += char;

				continue;
			} else if (numberTest.test(prevChar)) {
				finishCurrentWord();
				currentWord += char;

				continue;
			}
		}

		if (uppercaseTest.test(char)) {
			if (groupUppercase && uppercaseTest.test(prevChar)) {
				currentWord += char;

				continue;
			}

			finishCurrentWord();
			currentWord += char;

			continue;
		}

		currentWord += char;
	}

	if (currentWord.length > 0) {
		finishCurrentWord();
	}

	return words;
}
