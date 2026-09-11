export type Concat<T extends (unknown[] | unknown)[]> = T extends [infer V, ...infer R]
	? [...(V extends readonly unknown[] ? V : [V]), ...Concat<R>]
	: [];

/**
 * Returns an array based on the given values or values inside a given array.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of values.
 *
 * @template {(? | ?[])[]} T
 * @param {...T} values The values or array of values
 * @returns {Concat<T>} A new array with all given values and values inside a given array
 */
export function concat<const T extends (unknown | unknown[])[]>(...values: T): Concat<T> {
	const base: unknown[] = [];

	return base.concat(...values) as Concat<T>;
}
