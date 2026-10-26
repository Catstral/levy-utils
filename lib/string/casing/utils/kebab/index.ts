import { createUtilConfig } from "../../../../config";
import {
	readSplitCasingConfig,
	SPLIT_CASE_CONFIG_SHAPE,
	type SplitCasingConfig,
	type SplitCasingOptions,
} from "../../internal/splitCasing";
import { customCase } from "../custom";

/**
 * @typedef {Object} KebabCaseOptions
 * @prop {boolean} [screaming] Whether to uppercase every word instead of lowercasing them (SCREAMING-KEBAB-CASE)
 */

export interface KebabCaseOptions extends SplitCasingOptions {
	/**
	 * Whether to uppercase every word instead of lowercasing them (SCREAMING-KEBAB-CASE).
	 *
	 * @default false
	 */
	screaming?: boolean;
}

export interface KebabCaseUtilConfig extends SplitCasingConfig {
	screaming: boolean;
}

/**
 * Converts a string to kebab-case.
 *
 * Every word is lowercased (or uppercased if `options.screaming` is `true`) and joined together using a `-`.
 *
 * The time complexity for this is `O(n + m)` where:
 * - `n` is the length of the given string.
 * - `m` is the amount of words in `n`.
 *
 * @example
 * const str = kebabCase("hello world"); // -> "hello-world"
 *
 * @example
 * const str = kebabCase("helloWorld", { screaming: true }); // -> "HELLO-WORLD"
 *
 * @param {string} str The string to convert
 * @param {KebabCaseOptions} [options] The options used to convert the string (see {@link KebabCaseOptions} for more details)
 * @returns {string} The kebab-cased string
 */
export function kebabCase(str: string, options?: KebabCaseOptions): string {
	const splitCasingOptions = readSplitCasingConfig(kebabCase.config);
	const isScreaming = options?.screaming ?? kebabCase.config.screaming;

	return customCase(str, {
		...splitCasingOptions,
		...options,
		seperator: "-",
		transform: (word) => (isScreaming ? word.toUpperCase() : word.toLowerCase()),
	});
}

kebabCase.config = createUtilConfig<KebabCaseUtilConfig>({
	...SPLIT_CASE_CONFIG_SHAPE,
	screaming: {
		default: () => false,
	},
});

export interface ScreamingKebabCaseUtilConfig extends SplitCasingConfig {}

/**
 * Converts a string to SCREAMING-KEBAB-CASE.
 *
 * Equivalent to calling {@link kebabCase} with `options.screaming` set to `true`.
 *
 * The time complexity for this is `O(n)` where `n` is the length of the given string.
 *
 * @example
 * const str = screamingKebabCase("hello world"); // -> "HELLO-WORLD"
 *
 * @param {string} str The string to convert
 * @param {Omit<KebabCaseOptions, "screaming">} [options] The options used to convert the string (see {@link KebabCaseOptions} for more details)
 * @returns {string} The SCREAMING-KEBAB-CASEd string
 */
export function screamingKebabCase(str: string, options?: Omit<KebabCaseOptions, "screaming">): string {
	return kebabCase(str, {
		...options,
		screaming: true,
	});
}

screamingKebabCase.config = createUtilConfig<ScreamingKebabCaseUtilConfig>({
	...SPLIT_CASE_CONFIG_SHAPE,
});
