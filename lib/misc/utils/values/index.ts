import type { Key } from "~/types";

export type ValuesTarget =
	| ArrayLike<unknown>
	| Record<Key, unknown>
	| Map<unknown, unknown>
	| Set<unknown>
	| Iterable<unknown>;

export type Values<T extends ValuesTarget> =
	T extends ArrayLike<infer V>
		? V[]
		: T extends Record<Key, infer V>
			? V[]
			: T extends Map<unknown, infer V>
				? V[]
				: T extends Set<infer V>
					? V[]
					: T extends Iterable<infer V>
						? V[]
						: never;

/**
 * Returns an array of values based on the given target.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of values in the given `target`.
 *
 * @template {ValuesTarget} T
 * @param target The given value to extract values from
 * @returns {Values<T>} An array of values associated with `target`
 */
export function values<const T extends ValuesTarget>(target: T): Values<T> {
	if (target instanceof Map) {
		return Array.from(target.values()) as Values<T>;
	}

	if (typeof (target as Record<Key, unknown>)[Symbol.iterator] === "function") {
		return Array.from(target as ArrayLike<unknown>) as Values<T>;
	}

	return Object.values(target) as Values<T>;
}
