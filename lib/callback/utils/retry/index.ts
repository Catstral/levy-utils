import { createUtilConfig } from "../../../config";
import { UtilError } from "../../../error";
import { sleep } from "../../../misc/utils/sleep";
import type { Promisable } from "../../../types";

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

export interface RetryUtilConfig {
	attempts: number;
	delay: number;
	backoff: boolean;
	onRetry: ((error: unknown, attempt: number) => void) | undefined;
}

export async function retry<const T>(callback: () => Promisable<T>, options?: RetryOptions): Promise<T> {
	const retries = options?.attempts ?? retry.config.attempts;
	const backoff = options?.backoff ?? retry.config.backoff;
	const onRetry = options?.onRetry ?? retry.config.onRetry;

	let delay = options?.delay ?? retry.config.delay;
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
				onRetry?.(err, attempts);

				await sleep(delay);
			}
		}

		if (backoff) {
			delay *= 2;
		}
	}
}

retry.config = createUtilConfig<RetryUtilConfig>({
	attempts: {
		default: () => 3,
	},
	delay: {
		default: () => 1000,
	},
	backoff: {
		default: () => false,
	},
	onRetry: {
		default: () => undefined,
	},
});
