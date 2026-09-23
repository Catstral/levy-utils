import type { Promisable } from "~/types";

/**
 * A value that represents a wrapped result with varying success.
 *
 * @template T
 *
 * @see {@link safe} for executing a callback that returns an option
 * @see {@link uwnrap} for a utility that handles option values
 */
export type Option<T> =
	| {
			success: true;
			value: T;
			error?: never;
	  }
	| {
			success: false;
			value?: never;
			error: unknown;
	  };

/**
 * Executes the given callback and returns an option of the result.
 *
 * If a value is returned, the success of the option is `true`.
 * If an error is thrown, the success of the option is `false`.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {Promisable<?>} T
 * @param {() => T} callback The callback to wrap the value
 * @returns {T extends Promise<infer V> ? Promise<Option<V>> : Option<T>} The result wrapped in an `Option`
 *
 * @see {@link Option} for more details about an option value
 * @see {@link unwrap} for a utility that handles option values
 */
export function safe<const T>(callback: () => T): Option<T>;
export function safe<const T extends Promise<unknown>>(callback: () => T): Promise<Option<Awaited<T>>>;
export function safe<const T extends Promisable<unknown>>(
	callback: () => T,
): T extends Promise<infer V> ? Promise<Option<V>> : Option<T> {
	try {
		const value = callback();

		if (value instanceof Promise) {
			return value.then(
				(value) => ({
					success: true,
					value,
				}),
				(error) => ({
					success: false,
					error,
				}),
			) as T extends Promise<infer V> ? Promise<Option<V>> : Option<T>;
		}

		return {
			success: true,
			value,
		} as T extends Promise<infer V> ? Promise<Option<V>> : Option<T>;
	} catch (error) {
		return {
			success: false,
			error,
		} as T extends Promise<infer V> ? Promise<Option<V>> : Option<T>;
	}
}

/**
 * Directly returns the option's value, or throws the option's error.
 * An option's error won't be thrown when a fallback is provided.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {Promisable<?>} T
 * @param {...[option: Option<T>, fallback?: F]} args The callback to wrap the value
 * @returns {T extends Promise<infer V> ? Promise<Option<V>> : Option<T>} The result wrapped in an `Option`
 * @throws If the option is not a success and no `fallback` was provided
 *
 * @see {@link Option} for more details about an option value
 */
export function unwrap<const T>(...args: [option: Option<T>]): T;
export function unwrap<const T, const F>(...args: [option: Option<T>, fallback: F]): T | F;
export function unwrap<const T, const F = undefined>(...args: [option: Option<T>, fallback?: F]): T | F {
	const [option, fallback] = args;

	if (args.length > 1) {
		return option.success ? option.value : (fallback as F);
	}

	if (option.success) {
		return option.value;
	}

	throw option.error;
}
