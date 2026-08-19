import { customCase } from "./custom";
import type { SplitCasingOptions } from "./internal";

/**
 * @typedef {Object} SnakeCaseOptions
 * @prop {boolean} [screaming] Whether to uppercase every word instead of lowercasing them (SCREAMING_SNAKE_CASE)
 */

export interface SnakeCaseOptions extends SplitCasingOptions {
	/**
	 * Whether to uppercase every word instead of lowercasing them (SCREAMING_SNAKE_CASE).
	 *
	 * @default false
	 */
	screaming?: boolean;
}

/**
 * Converts a string to snake_case.
 *
 * Every word is lowercased (or uppercased if `options.screaming` is `true`) and joined together using a `_`.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = snakeCase("hello world"); // -> "hello_world"
 *
 * @example
 * const str = snakeCase("helloWorld", { screaming: true }); // -> "HELLO_WORLD"
 *
 * @param {string} str The string to convert
 * @param {SnakeCaseOptions} [options] The options used to convert the string (see {@link SnakeCaseOptions} for more details)
 * @returns {string} The snake_cased string
 */
export function snakeCase(str: string, options?: SnakeCaseOptions): string {
	return customCase(str, {
		...options,
		seperator: "_",
		transform: (word) => (options?.screaming ? word.toUpperCase() : word.toLowerCase()),
	});
}

/**
 * Converts a string to SCREAMING_SNAKE_CASE.
 *
 * Equivalent to calling {@link snakeCase} with `options.screaming` set to `true`.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = screamingSnakeCase("hello world"); // -> "HELLO_WORLD"
 *
 * @param {string} str The string to convert
 * @param {Omit<SnakeCaseOptions, "screaming">} [options] The options used to convert the string (see {@link SnakeCaseOptions} for more details)
 * @returns {string} The SCREAMING_SNAKE_CASEd string
 */
export function screamingSnakeCase(str: string, options?: Omit<SnakeCaseOptions, "screaming">): string {
	return snakeCase(str, {
		...options,
		screaming: true,
	});
}
