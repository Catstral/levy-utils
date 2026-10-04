export type Last<T extends readonly unknown[], F = undefined> = T extends readonly [...T[number][], infer V]
	? V
	: T[number] | F;

/**
 * Returns the last item of a list or a fallback if the list is empty.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template {readonly T[]} [L=T[]]
 * @template [F=undefined]
 * @param list The array to get the last item from
 * @param [fallback] The value to fall back to if the list is empty
 * @returns {First<L, F>} The last item of the list or a fallback
 */
export function last<const T, const L extends readonly T[] = T[]>(list: L): Last<L>;
export function last<const T, const L extends readonly T[] = T[], const F = undefined>(
	list: L,
	fallback?: F,
): Last<L, F>;
export function last<const T, const L extends readonly T[] = T[], const F = undefined>(
	list: L,
	fallback?: F,
): Last<L, F> {
	return (list.length === 0 ? fallback : list.at(-1)) as Last<L>;
}
