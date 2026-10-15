import type { AnyRecord } from "..";

export type InferArrayNumber<T extends unknown[]> = T extends []
	? never
	: T extends [unknown, ...infer Rest extends unknown[]]
		? Rest["length"] | InferArrayNumber<Rest>
		: number;

export type KeyPath<T extends AnyRecord> = T extends (infer R extends AnyRecord)[]
	? InferArrayNumber<T> | `${InferArrayNumber<T>}.${KeyPath<R>}`
	: T extends unknown[]
		? InferArrayNumber<T>
		: {
				[K in keyof T]: K extends string | number
					? T[K] extends (infer R extends AnyRecord)[]
						? `${K}.${InferArrayNumber<T[K]>}` | `${K}.${InferArrayNumber<T[K]>}.${KeyPath<R>}`
						: T[K] extends unknown[]
							? K | `${K}.${InferArrayNumber<T[K]>}`
							: T[K] extends AnyRecord
								? K | `${K}.${KeyPath<T[K]>}`
								: K
					: never;
			}[keyof T];
