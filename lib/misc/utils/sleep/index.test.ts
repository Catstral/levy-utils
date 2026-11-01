import { beforeEach, describe, expect, test } from "bun:test";
import { sleep } from ".";

describe.concurrent("sleep", () => {
	beforeEach(() => {
		sleep.config.reset();
	});

	test.concurrent("Resolves with undefined", async () => {
		const result = await sleep(5);

		expect(result).toBeUndefined();
	});

	test.concurrent("Resolves after roughly the given delay", async () => {
		const delay = 20;
		const start = Date.now();

		await sleep(delay);

		const elapsed = Date.now() - start;

		expect(elapsed).toBeGreaterThanOrEqual(delay - 5);
	});

	test.concurrent("Does not resolve synchronously", async () => {
		let resolved = false;

		const promise = sleep(10).then(() => {
			resolved = true;
		});

		expect(resolved).toBeFalse();

		await promise;

		expect(resolved).toBeTrue();
	});

	test.concurrent("Zero delay still resolves asynchronously", async () => {
		let resolved = false;

		const promise = sleep(0).then(() => {
			resolved = true;
		});

		expect(resolved).toBeFalse();

		await promise;

		expect(resolved).toBeTrue();
	});

	test.concurrent("Negative delay resolves without throwing", async () => {
		await expect(sleep(-100)).resolves.toBeUndefined();
	});
});
