/**
 * Checks if the given array has at least one item.
 *
 * The time complexity for this is `O(1)`.
 *
 * @templat T
 * @param {T[]} list The array to check
 * @returns {boolean} A boolean to signal if the given array has at least one item
 */
export function hasItems<const T>(list: [...T[], T]): list is [...T[], T];
export function hasItems<const T>(list: T[]): list is [T, ...T[]];
export function hasItems<const T>(list: readonly [...T[], T]): list is readonly [...T[], T];
export function hasItems<const T>(list: readonly T[]): list is readonly [T, ...T[]];
export function hasItems<const T>(list: readonly T[]): list is readonly [T, ...T[]] {
	return list.length > 0;
}
