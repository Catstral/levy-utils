export type Key = string | number | symbol;
export type Falsy = false | 0 | 0n | "" | null | undefined;
export type Promisable<T> = T | Promise<T>;
export type Entries<T extends object> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];
export type Primitive = string | number | boolean | symbol | null | undefined;
export type Computable<T, Args extends unknown[] = never[]> = T | ((...args: Args) => T);
