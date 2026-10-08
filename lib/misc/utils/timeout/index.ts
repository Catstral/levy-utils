import { UtilError } from "~/error";
import type { PositiveInteger } from "~/number";
import type { Computable } from "../compute";

export class TimeoutUtilError extends UtilError {
	public readonly util = "timeout";
}

export class TimeoutError extends Error {
	public constructor(delayMs: number) {
		super(`The operation was timed out after ${delayMs.toString()}ms`);

		this.name = "TimeoutError";
	}
}

export interface TimeoutOptions<_T, D = number> {
	onTimeout?: (delayMs: D) => void;
}

/**
 * ...
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @template {number} [D=number]
 * @param {} value The delay to wait to resolve the returned promise
 * @param {PositiveInteger<D>} delayMs The delay to wait to resolve the returned promise
 * @param {TimeoutOptions<T, D>} [options]
 * @returns {Promise<void>} A Promise that resolved after the specified delay has elapsed
 */
export async function timeout<const T, const D extends number = number>(
	value: Promise<T>,
	delayMs: PositiveInteger<D>,
	options?: TimeoutOptions<T, D>,
): Promise<T>;
export async function timeout<const T, const D extends number = number>(
	value: () => Promise<T>,
	delayMs: PositiveInteger<D>,
	options?: TimeoutOptions<T, D>,
): Promise<T>;
export async function timeout<const T>(
	value: Computable<Promise<T>>,
	delayMs: number,
	options?: TimeoutOptions<T>,
): Promise<T> {
	if (delayMs < 0) {
		throw new TimeoutUtilError("Timeout delay cannot be smaller than 0");
	}

	const promise = typeof value === "function" ? value() : value;

	return new Promise((resolve, reject) => {
		const handler = setTimeout(() => {
			options?.onTimeout?.(delayMs);

			reject(new TimeoutError(delayMs));
		}, delayMs);

		promise
			.then((result) => {
				clearTimeout(handler);
				resolve(result);
			})
			.catch((err) => {
				clearTimeout(handler);
				reject(err);
			});
	});
}

export function isTimeoutError(value: unknown): value is TimeoutError {
	return value instanceof TimeoutError;
}
