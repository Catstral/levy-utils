import { UtilError } from "~/error";
import type { PositiveInteger } from "~/number";

export class OverflowUtilError extends UtilError {
	public readonly util = "overflow";
}

/**
 * Returns a tuple of 2 arrays that are constructed from a single list based on the given clamp length.
 * The first item in the tuple is all the items in the list that pass the specified condition,
 * the second item in the tuple contains the rest of the list items.
 *
 * @template T
 * @template {number} L
 * @param {readonly T[]} list The list to seperate into a clamped and rest list
 * @param {PositiveInteger<L>} clampLength The length of the clamped list
 * @returns {[T[], T[]]} A tuple containing a clamped and rest list based off the given list and length
 * @throws {OverflowUtilError} If the clamp length is less than 1
 * @throws {OverflowUtilError} If the given items are not an array
 */
export function overflow<const T, const L extends number = number>(
	list: readonly T[],
	clampLength: PositiveInteger<L>,
): [T[], T[]] {
	if (clampLength < 0) {
		throw new OverflowUtilError("Clamp length cannot be smaller than 0");
	}

	if (!Array.isArray(list)) {
		throw new OverflowUtilError("List must be an array");
	}

	return [list.slice(0, clampLength), list.slice(clampLength)];
}
