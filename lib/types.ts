export type Key = string | number | symbol;
export type Falsy = false | 0 | 0n | "" | null | undefined;
export type Promisable<T> = T | Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: Expected any usage
export type AnyRecord = Record<Key, any>;
export type RecordOf<T> = Record<Key, T>;

export type EnumerateArrayLength<T extends readonly unknown[]> = T extends []
	? never
	: T extends readonly [unknown, ...infer Rest extends readonly unknown[]]
		? Rest["length"] | EnumerateArrayLength<Rest>
		: number;

export type KeyPath<T extends AnyRecord> = T extends (infer R extends AnyRecord)[]
	? EnumerateArrayLength<T> | `${EnumerateArrayLength<T>}` | `${EnumerateArrayLength<T>}.${KeyPath<R>}`
	: T extends readonly unknown[]
		? EnumerateArrayLength<T>
		: {
				[K in keyof T]: K extends string | number
					? T[K] extends (infer R extends AnyRecord)[]
						? `${K}.${EnumerateArrayLength<T[K]>}` | `${K}.${EnumerateArrayLength<T[K]>}.${KeyPath<R>}`
						: T[K] extends readonly unknown[]
							? K | `${K}.${EnumerateArrayLength<T[K]>}`
							: T[K] extends AnyRecord
								? K | `${K}.${KeyPath<T[K]>}`
								: K
					: never;
			}[keyof T];
