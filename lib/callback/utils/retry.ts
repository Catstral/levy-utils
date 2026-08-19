import { UtilError } from "~/error";
import { sleep } from "~/misc/utils/sleep";
import type { Promisable } from "~/types";

export class RetryUtilError extends UtilError {
	public readonly util = "retry";
}

// TODO: Write docs

export interface RetryOptions {
	/**
	 * Maximum retry attempts is retried.
	 *
	 * @default 3
	 */
	attempts?: number;
	/**
	 * Retry delay in milliseconds.
	 *
	 * @default 1000
	 */
	delay?: number;
	/**
	 * Whether to use exponential backoff.
	 *
	 * @default false
	 */
	backoff?: boolean;
	/**
	 * Callback function on retry.
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
				throw new RetryUtilError("Callback failed too often, stopping retry loop", {
					cause: err,
				});
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
