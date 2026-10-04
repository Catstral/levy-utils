import { describe, expect, test } from "bun:test";
import { last } from ".";

describe("last", () => {
	test("Returns the last item of a list", () => {
		const list = ["A", "B", "C"];

		expect(last(list)).toBe("C");
	});

	test("Returns undefined if the list is empty", () => {
		expect(last([])).toBeUndefined();
	});

	test("Returns the fallback if the list is empty", () => {
		expect(last([], "Hello")).toBe("Hello");
	});

	test("Doesn't mutate the original array", () => {
		const list = [1, 2, 3];

		last(list);
		last(list, null);

		expect(list).toEqual([1, 2, 3]);
	});
});
