/**
 * Converts an object into a types version of `Object.keys`.
 */
export function keys<const T extends Record<string, unknown>>(value: T): (keyof T)[] {
	return Object.keys(value);
}
