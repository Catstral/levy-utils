export type First<T extends readonly unknown[], F = undefined> = T extends readonly [infer V, ...T[number][]] ? V : T[number] | F;

/**
 * Returns the first item of a list or a fallback if the list is empty.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template {readonly T[]} [L=T[]]
 * @template [F=undefined]
 * @param list The array to get the first item from
 * @param [fallback] The value to fall back to if the list is empty
 * @returns {First<L, F>} The first item of the list or a fallback
 */
export function first<const T, const L extends readonly T[] = T[]>(list: L): First<L>;
export function first<const T, const L extends readonly T[] = T[], const F = undefined>(list: L, fallback?: F): First<L, F>;
export function first<const T, const L extends readonly T[] = T[], const F = undefined>(list: L, fallback?: F): First<L, F> {
	return (list.length === 0 ? fallback : list[0]) as First<L>;
}
