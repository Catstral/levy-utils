export type First<T extends unknown[], F = undefined> = T extends [infer V, ...T[number][]] ? V : T[number] | F;

export function first<const T, const L extends T[] = T[]>(list: L): First<L>;
export function first<const T, const L extends T[] = T[], const F = undefined>(list: L, fallback?: F): First<L, F>;
export function first<const T, const L extends T[] = T[], const F = undefined>(list: L, fallback?: F): First<L, F> {
	return (list.length === 0 ? fallback : list[0]) as First<L>;
}
