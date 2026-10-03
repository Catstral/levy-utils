import { UtilError } from "~/error";
import type { PositiveInteger } from "~/number";

export class OverflowUtilError extends UtilError {
	public readonly util = "overflow";
}

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
