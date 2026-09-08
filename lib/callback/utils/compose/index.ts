export type ComposeCallback<V = never> = ((previousValue: V) => unknown) | (() => unknown);

export type ComposeEntry = (...args: never[]) => unknown;

/**
 * @private
 */
type _ComposeResult<T extends ComposeCallback[], Prev> = T extends [
	infer Current extends ComposeCallback<Prev>,
	...infer Rest extends ComposeCallback[],
]
	? _ComposeResult<Rest, ReturnType<Current>>
	: Prev;

export type ComposeResult<T extends unknown[]> = T extends [
	infer Entry extends ComposeEntry,
	...infer Rest extends ComposeCallback[],
]
	? _ComposeResult<Rest, ReturnType<Entry>>
	: undefined;

/**
 * @private
 */
type _Compose<T extends unknown[], Prev> = T extends [
	infer Current extends ComposeCallback<Prev>,
	...infer Rest extends unknown[],
]
	? [Current, ..._Compose<Rest, ReturnType<Current>>]
	: T extends []
		? []
		: never;

export type Compose<T extends unknown[]> = number extends T["length"]
	? T
	: T extends [infer Entry extends ComposeEntry, ...infer Rest extends unknown[]]
		? [Entry, ..._Compose<Rest, ReturnType<Entry>>]
		: [];

export type ComposeParameters<T extends unknown[]> = T extends [infer Entry extends ComposeEntry, ...unknown[]]
	? Parameters<Entry>
	: [];

/**
 * Turns many callbacks into a single re-usable callback.
 *
 * Callbacks accept the result of the previous callback as an arugment,
 * returning the result of the final callback.
 *
 * NOTE: Due to a typescript limitation the arguments of the composed value
 * require a hint in order to infer the argument correctly (it does not allow
 * passing an invalid arugment type however)
 *
 * @example
 * // Note the type hint for the argument
 * const composed = compose((value: number) => value + 1, (value: number) => value * 2);
 * // This results in `composed(1)` being `4`, and can be called again with a different value
 *
 * @template {ComposeEntry[]} T
 * @param {Compose<T>} callbacks The callbacks to compose together
 * @returns {(...args: ComposeParameters<T>) => ComposeResult<T>} A callback that runs the composed callbacks and returns the final result
 */
export function compose<const T extends ComposeEntry[]>(
	...callbacks: Compose<T>
): (...args: ComposeParameters<T>) => ComposeResult<T> {
	return (...args: ComposeParameters<T>): ComposeResult<T> => {
		return callbacks.reduce<unknown>((acc, callback, index) => {
			const step = callback as (...args: unknown[]) => unknown;

			return index === 0 ? step(...(args as unknown[])) : step(acc)
		}, undefined) as ComposeResult<T>;
	};
}
