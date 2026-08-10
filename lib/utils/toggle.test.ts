import { describe, expect, test } from "bun:test";
import { toggle } from "./toggle";

describe("toggle", () => {
	describe("Appending", () => {
		test("Adds a new item to an empty array", () => {
			expect(toggle([], "a")).toEqual(["a"]);
		});

		test("Adds a new item to the end by default", () => {
			expect(toggle(["a"], "b")).toEqual(["a", "b"]);
		});

		test("Adds a new item to the end with explicit APPEND strategy", () => {
			expect(
				toggle(["a"], "b", {
					strategy: "APPEND",
				}),
			).toEqual(["a", "b"]);
		});
	});

	describe("Prepending", () => {
		test("Adds a new item to the start with PREPEND strategy", () => {
			expect(
				toggle(["a"], "b", {
					strategy: "PREPEND",
				}),
			).toEqual(["b", "a"]);
		});

		test("Adding to an empty array with PREPEND behaves the same as APPEND", () => {
			expect(
				toggle([], "a", {
					strategy: "PREPEND",
				}),
			).toEqual(["a"]);
		});
	});

	describe("Removing", () => {
		test("Removes an existing item", () => {
			expect(toggle(["a", "b"], "a")).toEqual(["b"]);
		});

		test("Only removes the first matching occurrence", () => {
			expect(toggle(["a", "a", "b"], "a")).toEqual(["a", "b"]);
		});

		test("Removes numbers", () => {
			expect(toggle([1, 2, 3], 2)).toEqual([1, 3]);
		});
	});

	describe("Default key comparison uses strict equality", () => {
		test("Objects with equal shape but different references are not considered equal", () => {
			expect(
				toggle([{ id: 1 }], {
					id: 1,
				}),
			).toEqual([
				{
					id: 1,
				},
				{
					id: 1,
				},
			]);
		});

		test("The exact same reference is removed", () => {
			const item = {
				id: 1,
			};

			expect(toggle([item], item)).toEqual([]);
		});
	});

	describe("Custom toKey", () => {
		test("Removes an item considered equal via the derived key", () => {
			expect(
				toggle(
					[
						{
							id: 1,
						},
						{
							id: 2,
						},
					],
					{
						id: 1,
					},
					{
						toKey: (item) => item.id,
					},
				),
			).toEqual([
				{
					id: 2,
				},
			]);
		});

		test("Appends an item whose derived key is not present", () => {
			expect(
				toggle(
					[
						{
							id: 1,
						},
					],
					{
						id: 2,
					},
					{
						toKey: (item) => item.id,
					},
				),
			).toEqual([
				{
					id: 1,
				},
				{
					id: 2,
				},
			]);
		});

		test("Prepends an item whose derived key is not present when using PREPEND", () => {
			expect(
				toggle(
					[{ id: 1 }],
					{
						id: 2,
					},
					{
						toKey: (item) => item.id,
						strategy: "PREPEND",
					},
				),
			).toEqual([
				{
					id: 2,
				},
				{ id: 1 },
			]);
		});
	});

	describe("Mutation behavior", () => {
		test("The returned array is a new reference, not the input array", () => {
			const list: string[] = [];
			const result = toggle(list, "a");

			expect(result).not.toBe(list);
		});

		test("The input array is left untouched", () => {
			const list = ["a", "b"];

			toggle(list, "a");

			expect(list).toEqual(["a", "b"]);
		});
	});
});
