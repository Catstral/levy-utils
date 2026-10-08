import { describe, expect, test } from "bun:test";
import { sample } from ".";

describe("sample", () => {
	test("Returns a value from inside the given list", () => {
		const list = [0, 1, 2, 3, 4, 5] as const;
		const sampled = sample(list);

		expect(list).toContain(sampled);
	});

	test("Returns undefined if an empty array is given", () => {
		const list = [] as const;
		const sampled = sample(list);

		expect(sampled).toBe(undefined);
	});

	test("Leaves the input unmodified", () => {
		const list = [0, 1, 2, 3, 4, 5];
		sample(list);

		expect(list).toEqual([0, 1, 2, 3, 4, 5]);
	});
});
