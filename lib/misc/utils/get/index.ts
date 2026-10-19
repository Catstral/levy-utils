import { UtilError } from "~/error";
import type { AnyRecord, KeyPath } from "~/types";

export class GetUtilError extends UtilError {
	public readonly util = "get";
}

/**
 * @private
 */
type GetIndex<K> = K extends `${infer N extends number}` ? N : K;

/**
 * @private
 */
type GetValue<T, K> = K extends keyof T ? T[K] : GetIndex<K> extends infer I extends keyof T ? T[I] : never;

/**
 * @private
 */
type GetPath<T, P> = P extends `${infer K}.${infer Rest}` ? GetPath<GetValue<T, K>, Rest> : GetValue<T, P>;

export type Get<T extends AnyRecord, P extends KeyPath<T>> = GetPath<T, P>;

export type GetOptions<F> =
	| {
			/**
			 *
			 * @default true
			 */
			strict?: true;
			fallback?: never;
	  }
	| {
			/**
			 * Whether to throw a {@link GetUtilError} when
			 *
			 * @default true
			 */
			strict: false;
			/**
			 * The value to default to when getting a value fails.
			 *
			 * The fallback only works if `strict` is false.
			 *
			 * @default undefined
			 */
			fallback?: F;
	  };

/**
 * Returns the value of an object using a given path.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of keys in the given path.
 *
 * @template {AnyRecord} T
 * @template {KeyPath<T>} [P=KeyPath<T>]
 * @template [F=undefined]
 * @param {T} object The target object
 * @param {P | (string & {}) | number} path The key path for the object
 * @param {Extract<GetOptions<F>, { strict?: true }>} [options] The options given to the getter
 * @returns {Get<T, P>} The value at given the path of the given object
 */
export function get<const T extends AnyRecord, const P extends KeyPath<T> = KeyPath<T>, const F = undefined>(
	object: T,
	path: P,
	options?: Extract<GetOptions<F>, { strict?: true }>,
): Get<T, P>;
/**
 * Returns the value of an object using a given path.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of keys in the given path.
 *
 * @template {AnyRecord} T
 * @template {KeyPath<T>} [P=KeyPath<T>]
 * @template [F=undefined]
 * @param {T} object The target object
 * @param {P | (string & {}) | number} path The key path for the object
 * @param {Extract<GetOptions<F>, { strict?: true }>} [options] The options given to the getter
 * @returns {Get<T, P>} The value at given the path of the given object
 */
export function get<const T extends AnyRecord, const P extends KeyPath<T> = KeyPath<T>, const F = undefined>(
	object: T,
	path: P | (string & {}) | number,
	options?: Extract<GetOptions<F>, { strict: false }>,
): Get<T, P> | F;
export function get(object: AnyRecord, path: string | number, options?: GetOptions<unknown>): unknown {
	const strict = options?.strict ?? true;
	const fallback = options?.fallback;
	const keyPath = path.toString().split(".");

	if (strict) {
		return keyPath.reduce<{
			value: unknown;
			path: string;
		}>(
			(acc, key) => {
				if (!acc.value || typeof acc.value !== "object") {
					throw new GetUtilError(
						acc.path
							? `Invalid key path, value at '${acc.path}' is not an object`
							: "Invalid key path, value is not an object",
					);
				}

				if (!(key in acc.value)) {
					throw new GetUtilError(
						acc.path
							? `Invalid key path, '${acc.path}.${key}' does not exist on value`
							: `Invalid key path, '${key}' does not exist on value`,
					);
				}

				acc.path += acc.path ? `.${key}` : key;
				acc.value = (acc.value as AnyRecord)[key];

				return acc;
			},
			{
				value: object,
				path: "",
			},
		).value;
	}

	let failed = false;

	return keyPath.reduce<unknown>((acc, key) => {
		if (failed) {
			return fallback;
		}

		if (!acc || typeof acc !== "object") {
			failed = true;

			return fallback;
		}

		if (!(key in acc)) {
			failed = true;

			return fallback;
		}

		return (acc as AnyRecord)[key];
	}, object);
}
