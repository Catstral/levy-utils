import { describe, expect, test } from "bun:test";
import { concat } from ".";

describe("concat", () => {
	test("No arguments returns an empty array", () => {
		expect(concat()).toEqual([]);
	});

	test("Concatenates multiple arrays", () => {
		const result = concat([1, 2], [3, 4], [5]);

		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	test("Flattens single values in with arrays", () => {
		const result = concat([1, 2], 3, [4, 5]);

		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	test("Only single values", () => {
		const result = concat(1, 2, 3);

		expect(result).toEqual([1, 2, 3]);
	});

	test("Empty arrays are ignored", () => {
		const result = concat([], [1, 2], [], [3]);

		expect(result).toEqual([1, 2, 3]);
	});

	test("Does not flatten nested arrays", () => {
		const result = concat([1, [2, 3]], [4]);

		expect(result).toEqual([1, [2, 3], 4]);
	});

	test("Mixed value types are preserved", () => {
		const obj = { foo: "bar" };
		const result = concat(["a"], 1, [obj], true, [null, undefined]);

		expect(result).toEqual(["a", 1, obj, true, null, undefined]);
	});

	test("Does not mutate the input arrays", () => {
		const first = [1, 2];
		const second = [3, 4];

		concat(first, second);

		expect(first).toEqual([1, 2]);
		expect(second).toEqual([3, 4]);
	});
});
