import { describe, expect, mock, test } from "bun:test";
import { group } from ".";

describe("group", () => {
	test("Groups items by a string key", () => {
		const grouped = group(
			[
				{
					type: "FOO",
					value: 1,
				},
				{
					type: "FOO",
					value: 2,
				},
				{
					type: "BAR",
					value: 3,
				},
			],
			({ type }) => type,
		);

		expect(grouped).toBeObject();
		expect(grouped).toContainKeys(["FOO", "BAR"]);
		expect(grouped.FOO).toEqual([
			{
				type: "FOO",
				value: 1,
			},
			{
				type: "FOO",
				value: 2,
			},
		]);
		expect(grouped.BAR).toEqual([
			{
				type: "BAR",
				value: 3,
			},
		]);
	});

	test("Groups items by a numeric key", () => {
		const grouped = group(
			[
				{
					value: 1,
				},
				{
					value: 1,
				},
				{
					value: 2,
				},
			],
			({ value }) => value,
		);

		expect(grouped).toBeObject();
		expect(grouped).toContainKeys([1, 2]);
		expect(grouped[1]).toEqual([
			{
				value: 1,
			},
			{
				value: 1,
			},
		]);
		expect(grouped[2]).toEqual([
			{
				value: 2,
			},
		]);
	});

	test("Empty list", () => {
		const identity = mock((item: { type: string }) => item.type);

		const grouped = group([] as { type: string }[], identity);

		expect(grouped).toBeObject();
		expect(grouped).toBeEmptyObject();
		expect(identity).not.toBeCalled();
	});

	test("Keys that never show up are not present on the result", () => {
		const grouped = group([{ type: "FOO" }], ({ type }) => type as "FOO" | "BAR");

		expect(grouped).toContainKeys(["FOO"]);
		expect(grouped.BAR).toBeUndefined();
	});

	test("Zero as a key", () => {
		const grouped = group(
			[
				{
					value: 0,
				},
				{
					value: 0,
				},
				{
					value: 1,
				},
			],
			({ value }) => value,
		);

		expect(grouped[0]).toEqual([{ value: 0 }, { value: 0 }]);
		expect(grouped[1]).toEqual([{ value: 1 }]);
	});

	test("Number and string identities collide on the same key", () => {
		const grouped = group(
			[
				{
					key: 1 as string | number,
				},
				{
					key: "1",
				},
			],
			({ key }) => key,
		);

		expect(grouped).toContainKeys(["1"]);
		expect(grouped[1]).toEqual([{ key: 1 }, { key: "1" }]);
	});

	test("Symbol identity", () => {
		const sym = Symbol("foo");

		const grouped = group(
			[
				{
					key: sym,
				},
				{
					key: sym,
				},
			],
			({ key }) => key,
		);

		expect(grouped[sym]).toEqual([{ key: sym }, { key: sym }]);
	});

	test("Preserves the order of items within a group", () => {
		const grouped = group([1, 2, 3, 4, 5, 6], (value) => (value % 2 === 0 ? "even" : "odd") as "even" | "odd");

		expect(grouped.odd).toEqual([1, 3, 5]);
		expect(grouped.even).toEqual([2, 4, 6]);
	});

	test("Identity is invoked exactly once per item", () => {
		const identity = mock((value: number) => (value > 2 ? "big" : "small"));

		group([1, 2, 3, 4], identity);

		expect(identity).toBeCalledTimes(4);
	});

	test("Identity receives only the item", () => {
		const identity = mock((value: string) => value);

		group(["foo", "bar"], identity);

		expect(identity).toHaveBeenNthCalledWith(1, "foo");
		expect(identity).toHaveBeenNthCalledWith(2, "bar");
	});

	test("Does not mutate the input list", () => {
		const list = [
			{
				type: "FOO",
			},
			{
				type: "BAR",
			},
		];

		group(list, ({ type }) => type);

		expect(list).toBeArrayOfSize(2);
		expect(list[0]).toEqual({ type: "FOO" });
		expect(list[1]).toEqual({ type: "BAR" });
	});

	test("Throws if the identity callback throws", () => {
		expect(() =>
			group([1, 2, 3], (value) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return value;
			}),
		).toThrow("Oops");
	});

	test("Stops calling the identity callback once it throws", () => {
		const identity = mock((value: number) => {
			if (value === 2) {
				throw new Error("Oops");
			}

			return value;
		});

		expect(() => group([1, 2, 3, 4], identity)).toThrow();
		expect(identity).toBeCalledTimes(2);
	});
});
