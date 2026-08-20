/**
 * Picks certain keys off of an object and returns a new object with only those keys (and values)
 *
 * The time complexity for this is `O(n)` where `n` is the amount of keys to pick.
 *
 * @template {Record<string, unknown>} T
 * @template {keyof T} K
 * @param {T} object The objects to pick the keys off of
 * @param {K | K[]} keys The keys to pick off of the object
 * @returns {Pick<T, K>} A new object with the picked keys
 */
export function pick<const T extends Record<string, unknown>, const K extends keyof T>(
	object: T,
	keys: K | K[],
): Pick<T, K> {
	const picked: Pick<T, K> = {} as Pick<T, K>;
	const finalKeys = Array.isArray(keys) ? keys : [keys];

	for (const key of finalKeys) {
		picked[key] = object[key];
	}

	return picked;
}
