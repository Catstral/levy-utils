export type Concat<T extends (unknown[] | unknown)[]> = T extends [infer V, ...infer R]
	? [...(V extends readonly unknown[] ? V : [V]), ...Concat<R>]
	: [];

// TODO: Docs

/**
 * The time complexity for this is `O(n)` where `n` is the amount of values.
 *
 * @param values
 * @returns
 */
export function concat<const T extends (unknown[] | unknown)[]>(...values: T): Concat<T> {
	const base: unknown[] = [];

	return base.concat(...values) as Concat<T>;
}
