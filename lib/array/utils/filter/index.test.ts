import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import { sleep } from "~/misc/utils/sleep";
import type { Promisable } from "~/types";
import { filter } from ".";

describe("filter", () => {
	describe("sync", () => {
		test("Keeps the items that pass the predicate", () => {
			expect(filter([1, 2, 3, 4], (value) => value > 2)).toEqual([3, 4]);
		});

		test("Empty list", () => {
			const predicate = mock((value: number) => value > 0);

			expect(filter([], predicate)).toBeArrayOfSize(0);
			expect(predicate).not.toBeCalled();
		});

		test("Returns an array instead of a promise", () => {
			const filtered = filter([1, 2, 3], () => true);

			expect(Array.isArray(filtered)).toBeTrue();
			expect(filtered).not.toBeInstanceOf(Promise);
		});

		test("All items pass the predicate", () => {
			expect(filter([1, 2, 3], () => true)).toEqual([1, 2, 3]);
		});

		test("All items fail the predicate", () => {
			expect(filter([1, 2, 3], () => false)).toBeArrayOfSize(0);
		});

		test("Preserves the order of the list", () => {
			expect(filter([5, 2, 4, 1, 3], (value) => value > 1)).toEqual([5, 2, 4, 3]);
		});

		test("Keeps duplicate items", () => {
			expect(filter([1, 2, 1, 2, 3], (value) => value < 3)).toEqual([1, 2, 1, 2]);
		});

		test("Removes items when the predicate returns a falsy value", () => {
			expect(filter([0, "", null, undefined, false, 0n, Number.NaN], (value) => value)).toBeArrayOfSize(0);
		});

		test("Keeps items when the predicate returns a truthy value", () => {
			const list = [1, "foo", true, {}, []];

			expect(filter(list, (value) => value)).toEqual(list);
		});

		test("Predicate receives the item, index and list", () => {
			const list = ["foo", "bar"];
			const predicate = mock((_value: string, _index: number, _source: readonly string[]) => true);

			filter(list, predicate);

			expect(predicate).toHaveBeenNthCalledWith(1, "foo", 0, list);
			expect(predicate).toHaveBeenNthCalledWith(2, "bar", 1, list);
		});

		test("Predicate is invoked exactly once per item", () => {
			const predicate = mock((value: number) => value > 2);

			filter([1, 2, 3, 4], predicate);

			expect(predicate).toBeCalledTimes(4);
		});

		test("Returns a new array", () => {
			const list = [1, 2, 3];

			expect(filter(list, () => true)).not.toBe(list);
		});

		test("Does not mutate the original list", () => {
			const list = [1, 2, 3];

			filter(list, (value) => value > 1);

			expect(list).toEqual([1, 2, 3]);
		});

		test("Type guard narrows the resulting list", () => {
			const mixed: (string | number)[] = ["foo", 1, "bar", 2];

			const isString = (value: string | number): value is string => typeof value === "string";

			const strings: string[] = filter(mixed, isString);

			expect(strings).toEqual(["foo", "bar"]);
		});

		test("Throws if the predicate throws", () => {
			expect(() =>
				filter([1, 2, 3], (value) => {
					if (value === 2) {
						throw new Error("Oops");
					}

					return true;
				}),
			).toThrow("Oops");
		});

		test("Stops calling the predicate once it throws", () => {
			const predicate = mock((value: number) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return true;
			});

			expect(() => filter([1, 2, 3, 4], predicate)).toThrow();
			expect(predicate).toBeCalledTimes(2);
		});
	});

	describe("async", () => {
		test("Returns a promise if the predicate returns promises", () => {
			const filtered = filter([1, 2, 3], async () => true);

			expect(filtered).toBeInstanceOf(Promise);
		});

		test("Resolves to the items that pass the predicate", async () => {
			expect(await filter([1, 2, 3, 4], async (value) => value > 2)).toEqual([3, 4]);
		});

		test("Empty list resolves to an empty array", async () => {
			const predicate = mock(async (_value: number) => true);

			expect(await filter([] as number[], predicate)).toBeArrayOfSize(0);
			expect(predicate).not.toBeCalled();
		});

		test("Includes the first item if only the first item passes", async () => {
			expect(await filter([1, 2, 3], async (value) => value === 1)).toEqual([1]);
		});

		test("All items pass the predicate", async () => {
			expect(await filter([1, 2, 3], async () => true)).toEqual([1, 2, 3]);
		});

		test("All items fail the predicate", async () => {
			expect(await filter([1, 2, 3], async () => false)).toBeArrayOfSize(0);
		});

		test("Preserves the order of the list regardless of when promises resolve", async () => {
			const filtered = await filter([30, 10, 20], async (value) => {
				await sleep(value);

				return true;
			});

			expect(filtered).toEqual([30, 10, 20]);
		});

		test("Starts all predicates without waiting for earlier ones to resolve", async () => {
			const predicate = mock(async (_value: number) => {
				await sleep(10);

				return true;
			});

			const filtered = filter([1, 2, 3], predicate);

			expect(predicate).toBeCalledTimes(3);
			expect(await filtered).toEqual([1, 2, 3]);
		});

		test("Removes items when the predicate resolves a falsy value", async () => {
			const filtered = await filter([0, "", null, undefined, false, 0n, Number.NaN], async (value) => value);

			expect(filtered).toBeArrayOfSize(0);
		});

		test("Keeps items when the predicate resolves a truthy value", async () => {
			const list = [1, "foo", true, {}, []];

			expect(await filter(list, async (value) => value)).toEqual(list);
		});

		test("Predicate receives the item, index and list", async () => {
			const list = ["foo", "bar"];
			const predicate = mock(async (_value: string, _index: number, _source: readonly string[]) => true);

			await filter(list, predicate);

			expect(predicate).toHaveBeenNthCalledWith(1, "foo", 0, list);
			expect(predicate).toHaveBeenNthCalledWith(2, "bar", 1, list);
		});

		test("Predicate is invoked exactly once per item", async () => {
			const predicate = mock(async (value: number) => value > 2);

			await filter([1, 2, 3, 4], predicate);

			expect(predicate).toBeCalledTimes(4);
		});

		test("Returns a new array", async () => {
			const list = [1, 2, 3];

			expect(await filter(list, async () => true)).not.toBe(list);
		});

		test("Does not mutate the original list", async () => {
			const list = [1, 2, 3];

			await filter(list, async (value) => value > 1);

			expect(list).toEqual([1, 2, 3]);
		});

		test("Rejects if a promise rejects", async () => {
			const filtered = filter([1, 2, 3], async (value) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return true;
			});

			await expect(filtered).rejects.toThrow("Oops");
		});
	});

	describe("mixed", () => {
		test("Returns a promise if only the first item is a promise", async () => {
			const filtered = filter([1, 2, 3], (value) => (value === 1 ? Promise.resolve(true) : true));

			expect(filtered).toBeInstanceOf(Promise);
			expect(await filtered).toEqual([1, 2, 3]);
		});

		test("Returns a promise if only the last item is a promise", async () => {
			const filtered = filter([1, 2, 3], (value) => (value === 3 ? Promise.resolve(true) : true));

			expect(filtered).toBeInstanceOf(Promise);
			expect(await filtered).toEqual([1, 2, 3]);
		});

		test("Keeps the items that passed synchronously before the first promise", async () => {
			const filtered = await filter([1, 2, 3, 4], (value) => {
				if (value <= 2) {
					return true;
				}

				return value === 3 ? Promise.resolve(true) : false;
			});

			expect(filtered).toEqual([1, 2, 3]);
		});

		test("Drops the items that failed synchronously before the first promise", async () => {
			const filtered = await filter([1, 2, 3, 4], (value) => {
				if (value <= 2) {
					return false;
				}

				return value === 3 ? Promise.resolve(true) : true;
			});

			expect(filtered).toEqual([3, 4]);
		});

		test("Preserves the order of the list", async () => {
			const filtered = await filter([1, 2, 3, 4, 5], (value) => {
				if (value % 2 === 0) {
					return sleep(10 / value).then(() => true);
				}

				return true;
			});

			expect(filtered).toEqual([1, 2, 3, 4, 5]);
		});

		test("Predicate is invoked exactly once per item", async () => {
			const predicate = mock((value: number) => (value === 2 ? Promise.resolve(true) : true));

			await filter([1, 2, 3, 4], predicate);

			expect(predicate).toBeCalledTimes(4);
		});

		test("Predicate receives the correct index for every item", async () => {
			const list = ["a", "b", "c"];
			const predicate = mock((value: string, _index: number, _source: readonly string[]) =>
				value === "b" ? Promise.resolve(true) : true,
			);

			await filter(list, predicate);

			expect(predicate).toHaveBeenNthCalledWith(1, "a", 0, list);
			expect(predicate).toHaveBeenNthCalledWith(2, "b", 1, list);
			expect(predicate).toHaveBeenNthCalledWith(3, "c", 2, list);
		});
	});

	describe("types", () => {
		const list: number[] = [];

		test("Sync predicate returns an array", () => {
			expectTypeOf(filter(list, (value) => value > 0)).toEqualTypeOf<number[]>();
		});

		test("Async predicate returns a promisable array", () => {
			expectTypeOf(filter(list, async (value) => value > 0)).toEqualTypeOf<Promisable<number[]>>();
		});

		test("Mixed predicate returns a promisable array", () => {
			expectTypeOf(filter(list, (value) => (value > 0 ? Promise.resolve(true) : false))).toEqualTypeOf<
				Promisable<number[]>
			>();
		});

		test("Type guard narrows the item type", () => {
			const mixed: (string | number)[] = [];

			expectTypeOf(filter(mixed, (value): value is string => typeof value === "string")).toEqualTypeOf<
				string[]
			>();
		});
	});
});
