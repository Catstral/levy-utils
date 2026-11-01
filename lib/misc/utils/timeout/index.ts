import { createUtilConfig } from "../../../config";
import { UtilError } from "../../../error";
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

export interface TimeoutOptions {
	/**
	 * A callback that runs when the delay has elapsed.
	 *
	 * Throwing a value inside this callback rejects the promise with that value instead of a {@link TimeoutError}.
	 *
	 * @param {number} delayMs
	 * @returns {void}
	 */
	onTimeout?: (delayMs: number) => void;
}

export interface TimeoutUtilConfig {
	[key: string]: never;
}

/**
 * Wraps the given promise into one that rejects after a given delay has elapsed.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template T
 * @param {Computable<Promise<T>, [signal: AbortSignal]>} value The promise or callback that returns a promise to handle
 * @param {number} delayMs The delay in milliseconds to wait before rejecting the promise
 * @param {TimeoutOptions<T>} [options] The options given to the timeout
 * @returns {Promise<T>} A promise that resolves with the given promise's result and rejects after the specified delay has elapsed
 * @throws {TimeoutUtilError} If the given delay is smaller than 0
 * @throws {TimeoutError} If the given delay has elapsed
 */
export async function timeout<const T>(
	value: Computable<Promise<T>, [signal: AbortSignal]>,
	delayMs: number,
	options?: TimeoutOptions,
): Promise<T> {
	if (delayMs < 0) {
		throw new TimeoutUtilError("Timeout delay cannot be smaller than 0");
	}

	const abortController = new AbortController();
	const promise = typeof value === "function" ? value(abortController.signal) : value;

	return new Promise((resolve, reject) => {
		const handler = setTimeout(() => {
			abortController.abort();

			try {
				options?.onTimeout?.(delayMs);
			} catch (err) {
				reject(err);

				return;
			}

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

timeout.config = createUtilConfig<TimeoutUtilConfig>({});

export interface IsTimeoutErrorUtilConfig {
	[key: string]: never;
}

/**
 * Checks if the given value is a timeout error.
 *
 * @param {?} value The value to check if it is a timeout error.
 * @returns {boolean} A boolean that signals if the given value is an instance of {@link TimeoutError}
 */
export function isTimeoutError(value: unknown): value is TimeoutError {
	return value instanceof TimeoutError;
}

isTimeoutError.config = createUtilConfig<IsTimeoutErrorUtilConfig>({});
