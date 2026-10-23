import type { AnyRecord, KeyPath } from "~/types";
import { get as baseGet, type GetOptions } from "./base";

export { type GetOptions, GetUtilError } from "./base";

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
	options?: GetOptions<F>,
): Get<T, P> | F;
export function get(object: AnyRecord, path: string | number, options?: GetOptions<unknown>): unknown {
	return baseGet(object, path, options);
}

export function hofGet<const T extends AnyRecord, const P extends KeyPath<T> = KeyPath<T>, const F = undefined>(
	path: P | (string & {}) | number,
	options?: GetOptions<F>,
): (object: T) => Get<T, P> | F;
export function hofGet(path: string | number, options?: GetOptions<unknown>): (object: AnyRecord) => unknown {
	return (object: AnyRecord) => baseGet(object, path, options);
}

export { hofGet as hGet };
