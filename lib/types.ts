export type Key = string | number | symbol;
export type Falsy = false | 0 | 0n | "" | null | undefined;
export type Promisable<T> = T | Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: Expected any usage
export type AnyRecord = Record<Key, any>
export type RecordOf<T> = Record<Key, T>
