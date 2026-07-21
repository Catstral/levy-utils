import { klona } from "klona";
import type { Entries, Falsy, Key, Primitive, Promisable, Tuple } from "~/types/helpers";

export function isObject(item: unknown): item is object {
	return typeof item === "object" && !!item && !Array.isArray(item);
}

export function isEmpty(value: unknown): boolean {
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

export function pick<const T extends Record<string, unknown>, const K extends keyof T>(
	obj: T,
	keys: K | K[],
): Pick<T, K> {
	const picked: Pick<T, K> = {} as Pick<T, K>;
	const finalKeys = Array.isArray(keys) ? keys : [keys];

	for (const key of finalKeys) {
		picked[key] = obj[key];
	}

	return picked;
}

export function omit<const T extends Record<string, unknown>, const K extends keyof T>(
	obj: T,
	keys: K | K[],
): Omit<T, K> {
	const omitted = klona(obj);
	const finalKeys = Array.isArray(keys) ? keys : [keys];

	for (const key of finalKeys) {
		delete omitted[key];
	}

	return omitted;
}

export function counting<const T, const V extends Key>(
	list: T[],
	identity: (item: T) => V,
): Partial<Record<V, number>> {
	const counts: Partial<Record<V, number>> = {};

	for (const item of list) {
		const key = identity(item);

		counts[key] = (counts[key] ?? 0) + 1;
	}

	return counts;
}

export function fork<const T, const V extends T>(list: T[], condition: (item: T) => item is V): [V[], Exclude<T, V>[]];
export function fork<const T>(list: T[], condition: (item: T) => boolean): Tuple<T[], 2>;
export function fork<const T>(list: T[], condition: (item: T) => boolean): Tuple<T[], 2> {
	const lists: Tuple<T[], 2> = [[], []];

	for (const item of list) {
		const index = condition(item) ? 0 : 1;

		lists[index].push(item);
	}

	return lists;
}

export interface RangeOptions<T> {
	valueMapper?: Computable<T, [step: number]> | undefined;
	step?: number;
}

export function* range<const T = number>(startOrLength: number, end?: number, options?: RangeOptions<T>): Generator<T> {
	let value = typeof end === "number" ? startOrLength : 0;
	const endValue = typeof end === "number" ? end : startOrLength;

	while (value <= endValue) {
		if (options?.valueMapper !== undefined) {
			yield compute(options.valueMapper, value);
		} else {
			yield value as T;
		}

		value += options?.step ?? 1;
	}
}

export interface ToggleOptions<T> {
	toKey?: (item: T) => Key;
	strategy?: "APPEND" | "PREPEND";
}

export function toggle<const T>(list: T[], itemToToggle: T, options?: ToggleOptions<T>): T[] {
	const toKey = (item: T) => {
		return options?.toKey?.(item) ?? item;
	};

	const index = list.findIndex((item) => toKey(item) === toKey(itemToToggle));

	if (index === -1) {
		const strategy = options?.strategy ?? "APPEND";

		switch (strategy) {
			case "APPEND": {
				list.push(itemToToggle);

				break;
			}
			case "PREPEND": {
				list.unshift(itemToToggle);

				break;
			}
		}
	} else {
		list.splice(index, 1);
	}

	return list;
}

export function sift<const T>(list: (T | Falsy)[]): T[] {
	return list.filter((item): item is T => !!item);
}

export function defer(callback: () => void): void {
	setTimeout(() => {
		callback();
	}, 0);
}

export async function sleep(delay: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, delay);
	});
}

export function isPrimitive(value: unknown): value is Primitive {
	if (value === null) {
		return true;
	}

	switch (typeof value) {
		case "boolean":
		case "number":
		case "string":
		case "symbol":
		case "undefined": {
			return true;
		}
		default: {
			return false;
		}
	}
}

export interface RetryOptions {
	/**
	 * Maximum retry attempts is retried
	 *
	 * @default 3
	 */
	attempts: number;
	/**
	 * Retry delay in milliseconds
	 *
	 * @default 1000
	 */
	delay?: number;
	/**
	 * Whether to use exponential backoff
	 *
	 * @default false
	 */
	backoff?: boolean;
	/**
	 * Callback function on retry
	 */
	onRetry?: (error: unknown, attempt: number) => void;
}

export async function retry<const T>(callback: () => Promisable<T>, options?: RetryOptions): Promise<T> {
	const retries = options?.attempts ?? 3;
	const backoff = options?.backoff ?? false;

	let delay = options?.delay ?? 1000;
	let attempts = 0;

	while (true) {
		attempts += 1;

		try {
			const result = await callback();

			return result;
		} catch (err) {
			if (attempts >= retries) {
				throw err;
			} else {
				options?.onRetry?.(err, attempts);

				await sleep(delay);
			}
		}

		if (backoff) {
			delay *= 2;
		}
	}
}

export function cluster<const T>(items: T[], size: number): T[][] {
	const cloned = klona(items);
	const clustered: T[][] = [[]];

	let index = 0;

	for (const item of cloned) {
		if (clustered[index].length <= size) {
			clustered[index].push(item);
		} else {
			index += 1;

			clustered[index] = [];
		}
	}

	return clustered;
}

export function slug(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}

export function parseUrlParams(url: string): Record<string, string | undefined>;
export function parseUrlParams<const T extends Record<string, (value: string | undefined) => unknown>>(
	url: string,
	transform: T,
): { [K in keyof T]: ReturnType<T[K]> };
export function parseUrlParams<const T extends Record<string, (value: string | undefined) => unknown>>(
	url: string,
	transform?: T,
): Record<string, string> | T {
	const parser = new URL(url);
	const obj = Object.fromEntries(parser.searchParams.entries());

	if (transform) {
		const result: Record<string, unknown> = {};

		for (const key in transform) {
			result[key] = transform[key](obj[key]);
		}

		return result as T;
	}

	return obj;
}

export function keys<const T extends Record<string, unknown>>(value: T): (keyof T)[] {
	return Object.keys(value);
}

export function entries<const T extends Record<string, unknown>>(value: T): Entries<T> {
	return Object.entries(value) as Entries<T>;
}

export function toInt(value: unknown, fallback: number = 0): number {
	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseInt(value.toString(), 10);

			break;
		}
		case "string": {
			result = Number.parseInt(value, 10);

			break;
		}
		default: {
			return fallback;
		}
	}

	if (Number.isNaN(result) || !Number.isFinite(result)) {
		return fallback;
	}

	return result;
}

export function toFloat(value: unknown, fallback: number = 0): number {
	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseFloat(value.toString());

			break;
		}
		case "string": {
			result = Number.parseFloat(value);

			break;
		}
		default: {
			return fallback;
		}
	}

	if (Number.isNaN(result) || !Number.isFinite(result)) {
		return fallback;
	}

	return result;
}
