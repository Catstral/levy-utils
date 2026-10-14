import { describe, expect, test } from "bun:test";
import { first } from ".";

describe("first", () => {
	test("Returns the first item of a list", () => {
		const list = ["A", "B", "C"];

		expect(first(list)).toBe("A");
	});

	test("Returns undefined if the list is empty", () => {
		expect(first([])).toBeUndefined();
	});

	test("Returns the fallback if the list is empty", () => {
		expect(first([], "Hello")).toBe("Hello");
	});

	test("Doesn't mutate the original array", () => {
		const list = [1, 2, 3];

		first(list);
		first(list, null);

		expect(list).toEqual([1, 2, 3]);
	});
});
