import { beforeEach, describe, expect, mock, test } from "bun:test";
import { isTimeoutError, TimeoutError, TimeoutUtilError, timeout } from ".";

function delayResolve<const T>(value: T, delayMs: number): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), delayMs));
}

function delayReject(error: unknown, delayMs: number): Promise<never> {
	return new Promise((_, reject) => setTimeout(() => reject(error), delayMs));
}

async function caught(promise: Promise<unknown>): Promise<unknown> {
	try {
		await promise;
	} catch (error) {
		return error;
	}

	throw new Error("Promise did not reject");
}

describe.concurrent("timeout", () => {
	beforeEach(() => {
		timeout.config.reset();
	});

	describe.concurrent("Promise", () => {
		test.concurrent("Resolves with the value if it settles before the delay", () => {
			expect(timeout(delayResolve("foo", 5), 100)).resolves.toBe("foo");
		});

		test.concurrent("Resolves with the value of an already resolved promise", () => {
			expect(timeout(Promise.resolve(5), 100)).resolves.toBe(5);
		});

		test.concurrent("Resolves with undefined", () => {
			expect(timeout(Promise.resolve(undefined), 100)).resolves.toBeUndefined();
		});

		test.concurrent("Resolves with the same object reference", () => {
			const original = {
				foo: "bar",
			};

			expect(timeout(Promise.resolve(original), 100)).resolves.toBe(original);
		});

		test.concurrent("Rejects with a TimeoutError if the promise does not settle in time", async () => {
			expect(timeout(delayResolve("foo", 100), 5)).rejects.toBeInstanceOf(TimeoutError);
		});

		test.concurrent("Rejects with the original error if the promise rejects before the delay", () => {
			const original = new RangeError("boom");

			expect(timeout(delayReject(original, 5), 100)).rejects.toBe(original);
		});

		test.concurrent("Rejects with an already rejected promise's reason", () => {
			const original = new Error("boom");

			expect(timeout(Promise.reject(original), 100)).rejects.toBe(original);
		});

		test.concurrent("Rejects with a non-Error reason as is", () => {
			expect(timeout(Promise.reject("foo"), 100)).rejects.toBe("foo");
			expect(timeout(Promise.reject(undefined), 100)).rejects.toBeUndefined();
		});

		test.concurrent("Times out roughly after the given delay", async () => {
			const delay = 30;
			const start = Date.now();

			try {
				await timeout(delayResolve("foo", 200), delay);
			} catch (err) {
				expect(err).toBeInstanceOf(TimeoutError);
			}

			const elapsed = Date.now() - start;

			expect(elapsed).toBeGreaterThanOrEqual(delay - 5);
			expect(elapsed).toBeLessThan(150);
		});

		test.concurrent("Does not resolve synchronously", async () => {
			let resolved = false;

			const promise = timeout(Promise.resolve("foo"), 100).then(() => {
				resolved = true;
			});

			expect(resolved).toBeFalse();

			await promise;

			expect(resolved).toBeTrue();
		});

		test.concurrent("A promise settling after the timeout does not change the outcome", async () => {
			expect(timeout(delayResolve("foo", 20), 5)).rejects.toBeInstanceOf(TimeoutError);

			// NOTE: This waits out the nested timer to check for side effects
			await delayResolve(undefined, 30);
		});

		test.concurrent("A rejection after the timeout is swallowed", async () => {
			expect(timeout(delayReject(new Error("late"), 20), 5)).rejects.toBeInstanceOf(TimeoutError);

			// NOTE: This waits out the nested timer to check for side effects
			await delayResolve(undefined, 30);
		});
	});

	describe.concurrent("Function", () => {
		test.concurrent("Resolves with the value of the returned promise", () => {
			expect(timeout(() => delayResolve("foo", 5), 100)).resolves.toBe("foo");
		});

		test.concurrent("Rejects with a TimeoutError if the returned promise does not settle in time", async () => {
			expect(timeout(() => delayResolve("foo", 100), 5)).rejects.toBeInstanceOf(TimeoutError);
		});

		test.concurrent("Rejects with the original error if the returned promise rejects", async () => {
			const original = new TypeError("boom");

			expect(timeout(() => Promise.reject(original), 100)).rejects.toBe(original);
		});

		test.concurrent("Calls the function exactly once, with an abort signal argument", async () => {
			const fn = mock((..._args: unknown[]) => Promise.resolve("foo"));

			await timeout(fn, 100);

			expect(fn).toBeCalledTimes(1);
			expect(fn.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
		});

		test.concurrent("Calls the function synchronously", () => {
			let called = false;

			const promise = timeout(() => {
				called = true;

				return Promise.resolve("foo");
			}, 100);

			expect(called).toBeTrue();

			return promise;
		});

		test.concurrent("Rejects if the function throws synchronously", async () => {
			const original = new Error("boom");

			expect(
				timeout((): Promise<string> => {
					throw original;
				}, 100),
			).rejects.toBe(original);
		});
	});

	describe.concurrent("Delay", () => {
		test.concurrent("Zero delay times out a pending promise", async () => {
			expect(timeout(delayResolve("foo", 20), 0)).rejects.toBeInstanceOf(TimeoutError);
		});

		test.concurrent("Negative delay rejects with a TimeoutUtilError", async () => {
			let error: unknown;

			try {
				await timeout(Promise.resolve("foo"), -1);

				expect().fail("Timeout expected to throw with negative delay");
			} catch (err) {
				error = err;
			}

			expect(error).toBeInstanceOf(TimeoutUtilError);
			expect((error as TimeoutUtilError)?.util).toBe("timeout");
			expect((error as Error)?.message).toBe("Timeout delay cannot be smaller than 0");
		});

		test.concurrent("Negative delay does not call the function", async () => {
			let called = false;

			try {
				await timeout(() => {
					called = true;

					return Promise.resolve("foo");
				}, -1);
			} catch {}

			expect(called).toBeFalse();
		});
	});

	describe.concurrent("TimeoutError", () => {
		test.concurrent("Has the name, and a message containing the delay", async () => {
			const error = (await caught(timeout(delayResolve("foo", 100), 5))) as TimeoutError;

			expect(error.name).toBe("TimeoutError");
			expect(error.message).toBe("The operation was timed out after 5ms");
		});

		test.concurrent("Is an instance of Error", async () => {
			expect(await caught(timeout(delayResolve("foo", 100), 5))).toBeInstanceOf(Error);
		});
	});

	describe.concurrent("onTimeout", () => {
		test.concurrent("Is called with the delay when the timeout elapses", async () => {
			const calls: number[] = [];

			await caught(
				timeout(delayResolve("foo", 100), 5, {
					onTimeout: (delayMs) => {
						calls.push(delayMs);
					},
				}),
			);

			expect(calls).toEqual([5]);
		});

		test.concurrent("Is called before the promise rejects", async () => {
			const order: string[] = [];
			const promise = timeout(delayResolve("foo", 100), 5, {
				onTimeout: () => {
					order.push("onTimeout");
				},
			}).catch(() => {
				order.push("rejected");
			});

			await promise;

			expect(order).toEqual(["onTimeout", "rejected"]);
		});

		test.concurrent("Is not called if the promise resolves in time", async () => {
			let called = false;

			await timeout(Promise.resolve("foo"), 50, {
				onTimeout: () => {
					called = true;
				},
			});
			await delayResolve(undefined, 70);

			expect(called).toBeFalse();
		});

		test.concurrent("Is not called if the promise rejects in time", async () => {
			let called = false;

			await caught(
				timeout(Promise.reject(new Error("boom")), 50, {
					onTimeout: () => {
						called = true;
					},
				}),
			);
			await delayResolve(undefined, 70);

			expect(called).toBeFalse();
		});

		test.concurrent("Is called only once", async () => {
			const onTimeout = mock(() => {});

			await caught(
				timeout(delayResolve("foo", 30), 5, {
					onTimeout,
				}),
			);
			await delayResolve(undefined, 50);

			expect(onTimeout).toBeCalledTimes(1);
		});

		test.concurrent("Is not called on a negative delay", async () => {
			let called = false;

			await caught(
				timeout(Promise.resolve("foo"), -1, {
					onTimeout: () => {
						called = true;
					},
				}),
			);

			expect(called).toBeFalse();
		});
	});
});

describe.concurrent("isTimeoutError", () => {
	beforeEach(() => {
		// NOTE: timeout is also being reset as it is also being used here
		timeout.config.reset();
		isTimeoutError.config.reset();
	});

	test.concurrent("True for a TimeoutError", () => {
		expect(isTimeoutError(new TimeoutError(5))).toBeTrue();
	});

	test.concurrent("True for an error produced by timeout", async () => {
		expect(isTimeoutError(await caught(timeout(delayResolve("foo", 100), 5)))).toBeTrue();
	});

	test.concurrent("False for a regular Error", () => {
		expect(isTimeoutError(new Error("foo"))).toBeFalse();
	});

	test.concurrent("False for a TimeoutUtilError", () => {
		expect(isTimeoutError(new (TimeoutUtilError as unknown as ErrorConstructor)("foo"))).toBeFalse();
	});

	test.concurrent("False for an object that only looks like a TimeoutError", () => {
		expect(
			isTimeoutError({
				name: "TimeoutError",
				message: "foo",
			}),
		).toBeFalse();
	});

	test.concurrent("False for non-error values", () => {
		expect(isTimeoutError("TimeoutError")).toBeFalse();
		expect(isTimeoutError(5)).toBeFalse();
		expect(isTimeoutError(null)).toBeFalse();
		expect(isTimeoutError(undefined)).toBeFalse();
	});
});
