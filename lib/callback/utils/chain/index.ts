export type ChainCallback<V = never> = ((previousValue: V) => unknown) | (() => unknown);

/**
 * @private
 */
type _ChainResult<N extends number, T extends ChainCallback[], R extends ChainCallback[], Prev> = N extends R["length"]
	? Prev
	: T extends [infer Current extends ChainCallback<Prev>, ...infer Rest extends ChainCallback[]]
		? _ChainResult<N, Rest, [...R, Current], ReturnType<Current>>
		: never;

export type ChainResult<T extends ChainCallback[]> = number extends T["length"]
	? ReturnType<T[number]>
	: _ChainResult<T["length"], T, [], undefined>;

/**
 * @private
 */
type _Chain<N extends number, T extends ChainCallback[], R extends ChainCallback[], Prev> = N extends R["length"]
	? R
	: T extends [infer Current extends ChainCallback<Prev>, ...infer Rest extends ChainCallback[]]
		? _Chain<N, Rest, [...R, Current], ReturnType<Current>>
		: never;

export type Chain<T extends ChainCallback[]> = number extends T["length"] ? T : _Chain<T["length"], T, [], undefined>;

/**
 * Allows chaining many callbacks together with the callback
 * accepting the result of the previous callback as an argument,
 * returning the result of the final callback
 *
 * NOTE: Due to a typescript limitation the arguments of the chained value
 * require a hint in order to infer the argument correctly (it does not allow
 * passing an invalid arugment type however)
 *
 * @example
 * // note the type hint for the argument
 * const result = chain(() => true, (value: boolean) => value ? "true" : "false");
 * // This results in `result` being `"true"`
 *
 * @template {Callback[]} T
 * @param {Chain<T>} callbacks The callbacks to chain together
 * @returns {ChainResult<T>} The returned value of the final chained callback
 */
export function chain<const T extends ChainCallback[]>(...callbacks: Chain<T>): ChainResult<T> {
	let value: unknown;

	for (const callback of callbacks) {
		value = callback(value as never);
	}

	return value as ChainResult<T>;
}
