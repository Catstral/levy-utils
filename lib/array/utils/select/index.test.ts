import { describe, expect, mock, test } from "bun:test";
import { select } from ".";

describe("fork", () => {
	test("Simple filter and mapper", () => {
		const selected = select(
			["foo", "bar"],
			(val) => val === "foo",
			(val) => val,
		);

		expect(selected).toBeArrayOfSize(1);
		expect(selected[0]).toBe("foo");
	});

	test("Empty list", () => {
		const selected = select(
			[] as number[],
			(val) => val > 0,
			(val) => val,
		);

		expect(selected).toBeArrayOfSize(0);
	});

	test("All items pass the condition", () => {
		const selected = select(
			[1, 2, 3],
			() => true,
			(val) => val,
		);

		expect(selected).toBeArrayOfSize(3);
		expect(selected).toEqual([1, 2, 3]);
	});

	test("All items fail the condition", () => {
		const selected = select(
			[1, 2, 3],
			() => false,
			(val) => val,
		);

		expect(selected).toBeArrayOfSize(0);
	});

	test("Preserves relative order within each resulting list", () => {
		const selected = select(
			[1, 2, 3, 4, 5],
			(val) => val % 2 === 1,
			(val) => val,
		);

		expect(selected).toEqual([1, 3, 5]);
	});

	test("Filter is invoked exactly once per item and the mapper only when filtered", () => {
		const filter = mock((val: number) => val > 2);
		const mapper = mock((val: number) => val.toString());

		select([1, 2, 3, 4], filter, mapper);

		expect(filter).toBeCalledTimes(4);
		expect(mapper).toBeCalledTimes(2);
	});

	test("Does not mutate the input list", () => {
		const list = [1, 2, 3];

		select(
			list,
			(val) => val > 1,
			(val) => val.toString(),
		);

		expect(list).toEqual([1, 2, 3]);
	});
});
