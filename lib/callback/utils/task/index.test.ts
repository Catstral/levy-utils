import { describe, expect, test } from "bun:test";
import { task } from ".";

describe.concurrent("task", () => {
	test.concurrent("Yields execution to the microtask queue when no callback is provided", async () => {
		const order: number[] = [];
		const promise = task().then(() => {
			order.push(3);
		});

		order.push(1);

		await Promise.resolve();

		order.push(2);

		await promise;

		expect(order).toEqual([1, 2, 3]);
	});

	test.concurrent("Executes a synchronous callback", async () => {
		let called = false;

		await task(() => {
			called = true;
		});

		expect(called).toBe(true);
	});

	test.concurrent("Awaits an asynchronous callback", async () => {
		let completed = false;

		await task(async () => {
			await Promise.resolve();

			completed = true;
		});

		expect(completed).toBe(true);
	});

	test.concurrent("Propagates errors from the callback", async () => {
		const error = new Error("test error");

		expect(
			task(async () => {
				throw error;
			}),
		).rejects.toBe(error);
	});

	test.concurrent("Executes concurrent callbacks independently", async () => {
		const completed: number[] = [];

		await Promise.all([
			task(async () => {
				await Promise.resolve();

				completed.push(1);
			}),
			task(async () => {
				await Promise.resolve();

				completed.push(2);
			}),
			task(async () => {
				await Promise.resolve();

				completed.push(3);
			}),
		]);

		expect(completed).toHaveLength(3);
		expect(completed).toEqual(expect.arrayContaining([1, 2, 3]));
	});

	test.concurrent("Concurrently yields multiple tasks", async () => {
		const completed: number[] = [];
		const tasks = [task(() => completed.push(1)), task(() => completed.push(2)), task(() => completed.push(3))];

		expect(completed).toEqual([1, 2, 3]);

		await Promise.all(tasks);

		expect(completed).toEqual([1, 2, 3]);
	});
});
