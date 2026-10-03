export type Last<T extends readonly unknown[], F = undefined> = T extends [...T[number][], infer V]
	? V
	: T extends [infer V, ...T[number][]]
		? V
		: T[number] | F;

export function last<const T, const L extends T[] = T[]>(list: L): Last<L>;
export function last<const T, const L extends T[] = T[], const F = undefined>(list: L, fallback?: F): Last<L, F>;
export function last<const T, const L extends T[] = T[], const F = undefined>(list: L, fallback?: F): Last<L, F> {
	return (list.length === 0 ? fallback : list.at(-1)) as Last<L>;
}
