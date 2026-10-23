import type { KeyPath } from "~/object/types";
import type { AnyRecord } from "~/types";
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

export function get<const T extends AnyRecord, const P extends KeyPath<T> = KeyPath<T>, const F = undefined>(
	object: T,
	path: P,
	options?: Extract<GetOptions<F>, { strict?: true }>,
): Get<T, P>;
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
