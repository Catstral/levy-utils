import { isObject } from "~/object/utils/isObject";

/**
 * Checks if the given value is considered empty.
 *
 * Empty values include:
 * - Empty arrays (`[]`)
 * - Empty objects (`{}`) (Do note that this checks keys, if a key exists without a value it not considered empty)
 * - Empty strings (`""`)
 * - `null`
 * - `undefined`
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is empty
 * @returns {boolean} A boolean to signal if the given value is empty
 */
export function isEmpty(value: string | null | undefined): value is "" | null | undefined;
export function isEmpty(value: unknown[] | null | undefined): value is [] | null | undefined;
export function isEmpty(
	value: Record<string, unknown> | null | undefined,
): value is Record<string, never> | null | undefined;
export function isEmpty(value: unknown): value is "" | [] | Record<string, never> | null | undefined;
export function isEmpty(value: unknown): value is "" | [] | Record<string, never> | null | undefined {
	// NOTE: this also passes for `undefined`
	if (value == null) {
		return true;
	}

	if (typeof value === "string") {
		return value.length === 0;
	}

	if (isObject(value)) {
		return Object.keys(value).length === 0;
	}

	if (Array.isArray(value)) {
		return value.length === 0;
	}

	return false;
}
