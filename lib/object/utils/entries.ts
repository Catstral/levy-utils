export type Entries<T extends object> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Converts an object into a types version of `Object.entries`.
 */
export function entries<const T extends Record<string, unknown>>(value: T): Entries<T> {
	return Object.entries(value) as Entries<T>;
}
