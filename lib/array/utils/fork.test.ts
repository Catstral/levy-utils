import { describe, expect, mock, test } from "bun:test";
import { fork } from "./fork";

describe("fork", () => {
	test("Simple condition", () => {
		const forked = fork(["foo", "bar"], (val) => val === "foo");

		expect(forked).toBeArrayOfSize(2);
		expect(forked[0]).toBeArrayOfSize(1);
		expect(forked[0][0]).toBe("foo");
		expect(forked[1]).toBeArrayOfSize(1);
		expect(forked[1][0]).toBe("bar");
	});

	test("Empty list", () => {
		const forked = fork([] as number[], (val) => val > 0);

		expect(forked).toBeArrayOfSize(2);
		expect(forked[0]).toBeArrayOfSize(0);
		expect(forked[1]).toBeArrayOfSize(0);
	});

	test("All items pass the condition", () => {
		const forked = fork([1, 2, 3], () => true);

		expect(forked[0]).toEqual([1, 2, 3]);
		expect(forked[1]).toBeArrayOfSize(0);
	});

	test("All items fail the condition", () => {
		const forked = fork([1, 2, 3], () => false);

		expect(forked[0]).toBeArrayOfSize(0);
		expect(forked[1]).toEqual([1, 2, 3]);
	});

	test("Preserves relative order within each resulting list", () => {
		const forked = fork([1, 2, 3, 4, 5], (val) => val % 2 === 0);

		expect(forked[0]).toEqual([2, 4]);
		expect(forked[1]).toEqual([1, 3, 5]);
	});

	test("Condition is invoked exactly once per item", () => {
		const condition = mock((val: number) => val > 2);

		fork([1, 2, 3, 4], condition);

		expect(condition).toBeCalledTimes(4);
	});

	test("Does not mutate the input list", () => {
		const list = [1, 2, 3];

		fork(list, (val) => val > 1);

		expect(list).toEqual([1, 2, 3]);
	});

	test("Type guard narrows the resulting tuple types", () => {
		const mixed: (string | number)[] = ["foo", 1, "bar", 2];

		const isString = (val: string | number): val is string => typeof val === "string";

		const [strings, numbers] = fork(mixed, isString);

		expect(strings).toEqual(["foo", "bar"]);
		expect(numbers).toEqual([1, 2]);
	});
});
