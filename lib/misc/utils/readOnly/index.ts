import type { Key } from "~/types";

export type ReadOnlyTarget =
	| Record<Key, unknown>
	| readonly unknown[]
	| unknown[]
	| Map<unknown, unknown>
	| Set<unknown>;

export type ReadOnly<T> =
	T extends Record<Key, unknown>
		? Readonly<T>
		: T extends readonly (infer U)[]
			? readonly U[]
			: T extends ReadonlyMap<infer K, infer V>
				? ReadonlyMap<K, V>
				: T extends ReadonlySet<infer U>
					? ReadonlySet<U>
					: T;

export type DeepReadOnly<T> =
	T extends Record<Key, unknown>
		? { readonly [K in keyof T]: DeepReadOnly<T[K]> }
		: T extends readonly (infer U)[]
			? readonly DeepReadOnly<U>[]
			: T extends ReadonlyMap<infer K, infer V>
				? ReadonlyMap<DeepReadOnly<K>, DeepReadOnly<V>>
				: T extends ReadonlySet<infer U>
					? ReadonlySet<DeepReadOnly<U>>
					: T;

/**
 * Checks if the given value is read-only.
 *
 * Whether an object's existing property attributes and values cannot be modified, and new properties cannot be added.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {Record<Key, unknown> | unknown[] | readonly unknown[]} T
 * @param {T} value The value to check if it is read-only
 * @returns {value is Readonly<T>} A boolean that signals if the given value is read-only
 */
export function isReadOnly<const T extends Record<Key, unknown> | unknown[] | readonly unknown[]>(
	value: T,
): value is Readonly<T> {
	return Object.isFrozen(value);
}

/**
 * Returns a shallow read-only copy of an object, array, map, or set.
 *
 * Only `value` itself is copied and frozen — nested objects/arrays/maps/sets keep the exact same
 * references as `value` and remain mutable.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of top-level entries in `value`.
 *
 * @template {ReadOnlyTarget} T
 * @param {T} value The object, array, map, or set to return a frozen shallow copy of
 * @param {false} [deepFreeze] Whether nested objects, arrays, maps, and sets should also be cloned and frozen
 * @returns {Readonly<T>} A frozen shallow copy of `value`
 */
export function readOnly<const T extends ReadOnlyTarget>(value: T, deepFreeze?: false): Readonly<T>;
/**
 * Returns a deep read-only copy of an object, array, map, or set.
 *
 * Every nested object, array, map, and set is recursively cloned and frozen, so nothing in the
 * result is shared with `value`.
 *
 * The time complexity for this is `O(n)` where `n` is the total amount of nested entries in `value`.
 *
 * @template {ReadOnlyTarget} T
 * @param {T} value The object, array, map, or set to return a frozen deep copy of
 * @param {true} deepFreeze Whether nested objects, arrays, maps, and sets should also be cloned and frozen
 * @returns {DeepReadOnly<T>} A deeply frozen copy of `value`
 */
export function readOnly<const T extends ReadOnlyTarget>(value: T, deepFreeze: true): DeepReadOnly<T>;
export function readOnly<const T extends ReadOnlyTarget>(value: T, deepFreeze: boolean): Readonly<T> | DeepReadOnly<T>;
export function readOnly<const T extends ReadOnlyTarget>(value: T, deepFreeze = false): Readonly<T> | DeepReadOnly<T> {
	const clone = (target: ReadOnlyTarget, deep: boolean): ReadOnlyTarget => {
		const cloneItem = (item: unknown) =>
			deep && item && typeof item === "object" ? clone(item as ReadOnlyTarget, deep) : item;

		if (target instanceof Map) {
			return new Map(Array.from(target, ([key, value]) => [cloneItem(key), cloneItem(value)]));
		}

		if (target instanceof Set) {
			return new Set(Array.from(target, cloneItem));
		}

		return Array.isArray(target)
			? target.map(cloneItem)
			: Object.fromEntries(
					Object.entries(target as Record<Key, unknown>).map(([key, value]) => [key, cloneItem(value)]),
				);
	};

	const cloned = clone(value, deepFreeze);

	if (!deepFreeze) {
		return Object.freeze(cloned) as Readonly<T>;
	}

	const freeze = (target: ReadOnlyTarget): ReadOnlyTarget => {
		const freezeItem = (item: unknown) => {
			if (item && typeof item === "object") {
				freeze(item as ReadOnlyTarget);
			}
		};

		if (target instanceof Map) {
			for (const [key, value] of target) {
				freezeItem(key);
				freezeItem(value);
			}
		} else if (target instanceof Set) {
			for (const value of target) {
				freezeItem(value);
			}
		} else {
			for (const value of Array.isArray(target) ? target : Object.values(target)) {
				freezeItem(value);
			}
		}

		return Object.freeze(target);
	};

	return freeze(cloned) as DeepReadOnly<T>;
}
