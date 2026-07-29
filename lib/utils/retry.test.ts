import { describe, expect, mock, test } from "bun:test";
import { RetryUtilError, retry } from "./retry";

describe.concurrent("retry", () => {
	test.concurrent("No retry", async () => {
		const fn = mock();

		await retry(fn);

		expect(fn).toBeCalledTimes(1);

		const calls = fn.mock.results;

		expect(calls[0].type).toBe("return");
	});

	test.concurrent("Retry ending in failure", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		expect(async () => {
			await retry(fn);
		}).toThrow();

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("throw");
		}
	});

	test.concurrent("Retry ending in failure without delay", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		expect(async () => {
			await retry(fn, {
				delay: 0,
			});
		}).toThrow();

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("throw");
		}
	});

	test.concurrent("Retry ending in failure with exponential backoff", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		expect(async () => {
			await retry(fn, {
				delay: 100,
				backoff: true,
			});
		}).toThrow();

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("throw");
		}
	});

	test.concurrent("Retry ending in failure with 1 attempt", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		expect(async () => {
			await retry(fn, {
				attempts: 1,
			});
		}).toThrow();

		expect(fn).toBeCalledTimes(1);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("throw");
		}
	});

	test.concurrent("Retry ending in success", async () => {
		let currentAttempt = 0;

		const fn = mock((attempt: number) => {
			if (attempt > 1) {
				return;
			}

			throw new Error("Some failure");
		});

		const onRetry = mock((_: unknown, attempt: number) => {
			currentAttempt = attempt;
		});

		await retry(() => fn(currentAttempt), {
			onRetry,
		});

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		expect(calls[0].type).toBe("throw");
		expect(calls[1].type).toBe("throw");
		expect(calls[2].type).toBe("return");

		expect(onRetry).toBeCalledTimes(2);

		const retryCalls = onRetry.mock.calls;

		expect(retryCalls[0][0]).toBeInstanceOf(Error);
		expect(retryCalls[0][1]).toBe(1);
		expect(retryCalls[1][0]).toBeInstanceOf(Error);
		expect(retryCalls[1][1]).toBe(2);
	});

	test.concurrent("Retry throws a UtilError wrapping the original error as the cause", async () => {
		const originalError = new Error("Some failure");

		const fn = mock(() => {
			throw originalError;
		});

		let thrown: unknown;

		try {
			await retry(fn, {
				attempts: 1,
			});
		} catch (err) {
			thrown = err;
		}

		expect(thrown).toBeInstanceOf(RetryUtilError);
		expect((thrown as RetryUtilError).util).toBe("retry");
		expect((thrown as RetryUtilError).cause).toBe(originalError);
	});

	test.concurrent("Uses the default delay of 1000ms when no delay is specified", async () => {
		let callCount = 0;

		const fn = mock(() => {
			callCount += 1;

			if (callCount === 1) {
				throw new Error("Some failure");
			}
		});

		const start = performance.now();

		await retry(fn);

		const elapsed = performance.now() - start;

		expect(fn).toBeCalledTimes(2);
		// The default delay is 1000ms and there is exactly one retry, so the elapsed time should be at
		// least ~1000ms (a small tolerance is allowed for timer jitter under concurrent test load).
		expect(elapsed).toBeGreaterThanOrEqual(950);
		expect(elapsed).toBeLessThan(1900);
	});

	test.concurrent("Default backoff is disabled, so retry delays stay constant across attempts", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		const start = performance.now();

		try {
			await retry(fn, {
				delay: 100,
			});
		} catch {
			// expected
		}

		const elapsed = performance.now() - start;

		expect(fn).toBeCalledTimes(3);
		// 2 retries at a constant 100ms delay each = ~200ms total. If backoff were mistakenly on by
		// default, this would instead be ~300ms (100 + 200). A wide tolerance is allowed for timer jitter.
		expect(elapsed).toBeGreaterThanOrEqual(170);
		expect(elapsed).toBeLessThan(270);
	});

	test.concurrent("Retry succeeding on the first retry with backoff only sleeps once, using the initial delay", async () => {
		let callCount = 0;

		const fn = mock(() => {
			callCount += 1;

			if (callCount === 1) {
				throw new Error("Some failure");
			}
		});

		const start = performance.now();

		await retry(fn, {
			delay: 50,
			backoff: true,
		});

		const elapsed = performance.now() - start;

		expect(fn).toBeCalledTimes(2);
		// Only a single (non-doubled) delay of 50ms should be waited out, since success happens right
		// after the first retry, before backoff would have a chance to double the delay again.
		expect(elapsed).toBeGreaterThanOrEqual(40);
		expect(elapsed).toBeLessThan(100);
	});

	test.concurrent("Exponential backoff delays compound across multiple retries", async () => {
		const fn = mock(() => {
			throw new Error("Some failure");
		});

		const start = performance.now();

		try {
			await retry(fn, {
				delay: 30,
				backoff: true,
			});
		} catch {
			// expected
		}

		const elapsed = performance.now() - start;

		expect(fn).toBeCalledTimes(3);
		// 2 retries: first waits 30ms, then delay doubles to 60ms for the second wait = ~90ms total.
		expect(elapsed).toBeGreaterThanOrEqual(80);
		expect(elapsed).toBeLessThan(150);
	});
});
