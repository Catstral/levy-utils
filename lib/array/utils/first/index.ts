import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export type First<T extends readonly unknown[], F = undefined> = T extends readonly [infer V, ...T[number][]]
	? V
	: T[number] | (T extends readonly [...T[number][], T[number]] ? never : F);

export interface FirstConfig {
	[key: string]: never;
}

/**
 * Returns the first item of a list or a fallback if the list is empty.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template [F=undefined]
 * @param list The array to get the first item from
 * @param [fallback] The value to fall back to if the list is empty
 * @returns {First<T, F>} The first item of the list or a fallback
 */
export function first<const T extends readonly unknown[], const F = undefined>(list: T, fallback?: F): First<T, F> {
	return (list.length === 0 ? fallback : list[0]) as First<T, F>;
}

first.config = createUtilConfig<UtilConfigDefinitionShape<FirstConfig>>({});
