import { describe, expect, mock, test } from "bun:test";
import { retry } from "./retry";

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
});
