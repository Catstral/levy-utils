import { customCase } from "./custom";
import type { SplitCasingOptions } from "./internal";

/**
 * @typedef {Object} HttpHeaderCaseOptions
 */

export interface HttpHeaderCaseOptions extends SplitCasingOptions {}

/**
 * Converts a string to HTTP-Header-Case (also known as Train-Case).
 *
 * Every word has its first letter uppercased with the rest lowercased, and words are joined together using a `-`.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = httpHeaderCase("content type"); // -> "Content-Type"
 *
 * @example
 * const str = httpHeaderCase("x_forwarded_for"); // -> "X-Forwarded-For"
 *
 * @param {string} str The string to convert
 * @param {HttpHeaderCaseOptions} [options] The options used to convert the string (see {@link HttpHeaderCaseOptions} for more details)
 * @returns {string} The HTTP-Header-Cased string
 */
export function httpHeaderCase(str: string, options?: HttpHeaderCaseOptions): string {
	return customCase(str, {
		...options,
		seperator: "-",
		transform: (word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`,
	});
}

export { type HttpHeaderCaseOptions as TrainCaseOptions, httpHeaderCase as trainCase };
