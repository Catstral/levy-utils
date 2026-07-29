export type Key = string | number | symbol;
export type Falsy = false | 0 | 0n | "" | null | undefined;
export type Promisable<T> = T | Promise<T>;
