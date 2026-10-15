import type { AnyRecord } from "~/types";

/**
 * Converts an object into a types version of `Object.keys`.
 */
export function keys<const T extends AnyRecord>(value: T): (keyof T)[] {
	return Object.keys(value);
}
