export type Concat<T extends (unknown[] | unknown)[]> = T extends [infer V, ...infer R]
	? [...(V extends readonly unknown[] ? V : [V]), ...Concat<R>]
	: [];

/**
 * Concatenates values and arrays into a new array.
 *
 * Array arguments are flattened by one level.
 * Non-array arguments are added as individual values.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of values.
 *
 * @template {(? | ?[])[]} T
 * @param {...T} values Values or arrays of values to concatenate
 * @returns {Concat<T>} A new array containing all provided values
 */
export function concat<const T extends (unknown | unknown[])[]>(...values: T): Concat<T> {
	const base: unknown[] = [];

	return base.concat(...values) as Concat<T>;
}
