import { describe, expect, test } from "bun:test";
import { defer } from "./defer";

describe.concurrent("defer", () => {
	test.concurrent("Does not call the callback synchronously", () => {
		let called = false;

		defer(() => {
			called = true;
		});

		expect(called).toBeFalse();
	});

	test.concurrent("Calls the callback on the next execution cycle", async () => {
		let called = false;

		await new Promise<void>((resolve) => {
			defer(() => {
				called = true;

				resolve();
			});
		});

		expect(called).toBeTrue();
	});

	test.concurrent("Returns undefined", () => {
		expect(defer(() => {})).toBeUndefined();
	});

	test.concurrent("Calls multiple deferred callbacks in the order they were scheduled", async () => {
		const order: number[] = [];

		await new Promise<void>((resolve) => {
			defer(() => order.push(1));
			defer(() => order.push(2));
			defer(() => {
				order.push(3);

				resolve();
			});
		});

		expect(order).toEqual([1, 2, 3]);
	});
});
