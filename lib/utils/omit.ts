import { klona } from "klona";

/**
 * Omits certain keys off of an object and returns a new object without those keys.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of keys to omit.
 *
 * @template {Record<string, unknown>} T
 * @template {keyof T} K
 * @param {T} object The objects to omit the keys off of
 * @param {K | K[]} keys The keys to omit off of the object
 * @returns {Omit<T, K>} A new object without the omitted keys
 */
export function omit<const T extends Record<string, unknown>, const K extends keyof T>(
	object: T,
	keys: K | K[],
): Omit<T, K> {
	const omitted = klona(object);
	const finalKeys = Array.isArray(keys) ? keys : [keys];

	for (const key of finalKeys) {
		delete omitted[key];
	}

	return omitted;
}
