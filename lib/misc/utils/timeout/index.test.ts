import { describe, expect, mock, test } from "bun:test";
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

describe("timeout", () => {
	describe("Promise", () => {
		test("Resolves with the value if it settles before the delay", () => {
			expect(timeout(delayResolve("foo", 5), 100)).resolves.toBe("foo");
		});

		test("Resolves with the value of an already resolved promise", () => {
			expect(timeout(Promise.resolve(5), 100)).resolves.toBe(5);
		});

		test("Resolves with undefined", () => {
			expect(timeout(Promise.resolve(undefined), 100)).resolves.toBeUndefined();
		});

		test("Resolves with the same object reference", () => {
			const original = {
				foo: "bar",
			};

			expect(timeout(Promise.resolve(original), 100)).resolves.toBe(original);
		});

		test("Rejects with a TimeoutError if the promise does not settle in time", async () => {
			expect(timeout(delayResolve("foo", 100), 5)).rejects.toBeInstanceOf(TimeoutError);
		});

		test("Rejects with the original error if the promise rejects before the delay", () => {
			const original = new RangeError("boom");

			expect(timeout(delayReject(original, 5), 100)).rejects.toBe(original);
		});

		test("Rejects with an already rejected promise's reason", () => {
			const original = new Error("boom");

			expect(timeout(Promise.reject(original), 100)).rejects.toBe(original);
		});

		test("Rejects with a non-Error reason as is", () => {
			expect(timeout(Promise.reject("foo"), 100)).rejects.toBe("foo");
			expect(timeout(Promise.reject(undefined), 100)).rejects.toBeUndefined();
		});

		test("Times out roughly after the given delay", async () => {
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

		test("Does not resolve synchronously", async () => {
			let resolved = false;

			const promise = timeout(Promise.resolve("foo"), 100).then(() => {
				resolved = true;
			});

			expect(resolved).toBeFalse();

			await promise;

			expect(resolved).toBeTrue();
		});

		test("A promise settling after the timeout does not change the outcome", async () => {
			expect(timeout(delayResolve("foo", 20), 5)).rejects.toBeInstanceOf(TimeoutError);

			await delayResolve(undefined, 30);
		});

		test("A rejection after the timeout is swallowed", async () => {
			expect(timeout(delayReject(new Error("late"), 20), 5)).rejects.toBeInstanceOf(TimeoutError);

			await delayResolve(undefined, 30);
		});
	});

	describe("Function", () => {
		test("Resolves with the value of the returned promise", () => {
			expect(timeout(() => delayResolve("foo", 5), 100)).resolves.toBe("foo");
		});

		test("Rejects with a TimeoutError if the returned promise does not settle in time", async () => {
			expect(timeout(() => delayResolve("foo", 100), 5)).rejects.toBeInstanceOf(TimeoutError);
		});

		test("Rejects with the original error if the returned promise rejects", async () => {
			const original = new TypeError("boom");

			expect(timeout(() => Promise.reject(original), 100)).rejects.toBe(original);
		});

		test("Calls the function exactly once, without arguments", async () => {
			const fn = mock((..._args: unknown[]) => Promise.resolve("foo"));

			await timeout(fn, 100);

			expect(fn).toBeCalledTimes(1);
			expect(fn).toBeCalledWith;
		});

		test("Calls the function synchronously", () => {
			let called = false;

			const promise = timeout(() => {
				called = true;

				return Promise.resolve("foo");
			}, 100);

			expect(called).toBeTrue();

			return promise;
		});

		test("Rejects if the function throws synchronously", async () => {
			const original = new Error("boom");

			expect(
				timeout((): Promise<string> => {
					throw original;
				}, 100),
			).rejects.toBe(original);
		});
	});

	describe("Delay", () => {
		test("Zero delay times out a pending promise", async () => {
			expect(timeout(delayResolve("foo", 20), 0)).rejects.toBeInstanceOf(TimeoutError);
		});

		test("Negative delay rejects with a TimeoutUtilError", async () => {
			let error: unknown;

			try {
				await timeout(Promise.resolve("foo"), -1);

				throw null; // NOTE: This is so the try statement always throws an error
			} catch (err) {
				error = err;
			}

			expect(error).toBeInstanceOf(TimeoutUtilError);
			expect((error as TimeoutUtilError)?.util).toBe("timeout");
			expect((error as Error)?.message).toBe("Timeout delay cannot be smaller than 0");
		});

		test("Negative delay does not call the function", async () => {
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

	describe("TimeoutError", () => {
		test("Has the name, and a message containing the delay", async () => {
			const error = (await caught(timeout(delayResolve("foo", 100), 5))) as TimeoutError;

			expect(error.name).toBe("TimeoutError");
			expect(error.message).toBe("The operation was timed out after 5ms");
		});

		test("Is an instance of Error", async () => {
			expect(await caught(timeout(delayResolve("foo", 100), 5))).toBeInstanceOf(Error);
		});
	});

	describe("onTimeout", () => {
		test("Is called with the delay when the timeout elapses", async () => {
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

		test("Is called before the promise rejects", async () => {
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

		test("Is not called if the promise resolves in time", async () => {
			let called = false;

			await timeout(Promise.resolve("foo"), 50, {
				onTimeout: () => {
					called = true;
				},
			});
			await delayResolve(undefined, 70);

			expect(called).toBeFalse();
		});

		test("Is not called if the promise rejects in time", async () => {
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

		test("Is called only once", async () => {
			let calls = 0;

			await caught(
				timeout(delayResolve("foo", 30), 5, {
					onTimeout: () => {
						calls++;
					},
				}),
			);
			await delayResolve(undefined, 50);

			expect(calls).toBe(1);
		});

		test("Is not called on a negative delay", async () => {
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

describe("isTimeoutError", () => {
	test("True for a TimeoutError", () => {
		expect(isTimeoutError(new TimeoutError(5))).toBeTrue();
	});

	test("True for an error produced by timeout", async () => {
		expect(isTimeoutError(await caught(timeout(delayResolve("foo", 100), 5)))).toBeTrue();
	});

	test("False for a regular Error", () => {
		expect(isTimeoutError(new Error("foo"))).toBeFalse();
	});

	test("False for a TimeoutUtilError", () => {
		expect(isTimeoutError(new (TimeoutUtilError as unknown as ErrorConstructor)("foo"))).toBeFalse();
	});

	test("False for an object that only looks like a TimeoutError", () => {
		expect(
			isTimeoutError({
				name: "TimeoutError",
				message: "foo",
			}),
		).toBeFalse();
	});

	test("False for non-error values", () => {
		expect(isTimeoutError("TimeoutError")).toBeFalse();
		expect(isTimeoutError(5)).toBeFalse();
		expect(isTimeoutError(null)).toBeFalse();
		expect(isTimeoutError(undefined)).toBeFalse();
	});
});
