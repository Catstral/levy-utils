import { describe, expect, test } from "bun:test";
import { counting } from "./counting";

describe("counting", () => {
	test("Counts occurrences grouped by a string key", () => {
		const counted = counting(
			[
				{
					type: "FOO",
				},
				{
					type: "FOO",
				},
				{
					type: "BAR",
				},
			],
			({ type }) => type,
		);

		expect(counted).toBeObject();
		expect(counted).toContainKeys(["FOO", "BAR"]);
		expect(counted.FOO).toBe(2);
		expect(counted.BAR).toBe(1);
	});

	test("Counts occurrences grouped by a numeric key", () => {
		const counted = counting(
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

		expect(counted).toBeObject();
		expect(counted).toContainKeys([1, 2]);
		expect(counted[1]).toBe(2);
		expect(counted[2]).toBe(1);
	});

	test("Empty list", () => {
		const counted = counting(
			[] as {
				type: string;
			}[],
			({ type }) => type,
		);

		expect(counted).toBeObject();
		expect(counted).toBeEmptyObject();
	});

	test("Zero as a key", () => {
		const counted = counting(
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

		expect(counted[0]).toBe(2);
		expect(counted[1]).toBe(1);
	});

	test("Number and string identities collide on the same key", () => {
		const counted = counting(
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

		expect(counted).toContainKeys(["1"]);
		expect(counted[1]).toBe(2);
	});

	test("Symbol identity", () => {
		const sym = Symbol("foo");

		const counted = counting(
			[
				{
					key: sym,
				},
				{ key: sym },
			],
			({ key }) => key,
		);

		expect(counted[sym]).toBe(2);
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

		counting(list, ({ type }) => type);

		expect(list).toBeArrayOfSize(2);
		expect(list[0]).toEqual({
			type: "FOO",
		});
		expect(list[1]).toEqual({
			type: "BAR",
		});
	});
});
