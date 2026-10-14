import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import { sleep } from "~/misc/utils/sleep";
import type { Promisable } from "~/types";
import { map } from ".";

describe("map", () => {
	describe("sync", () => {
		test("Maps every item of a list", () => {
			expect(map([1, 2, 3], (value) => value * 2)).toEqual([2, 4, 6]);
		});

		test("Empty list", () => {
			const callback = mock((value: number) => value);

			expect(map([], callback)).toBeArrayOfSize(0);
			expect(callback).not.toBeCalled();
		});

		test("Returns an array instead of a promise", () => {
			const mapped = map([1, 2, 3], (value) => value);

			expect(Array.isArray(mapped)).toBeTrue();
			expect(mapped).not.toBeInstanceOf(Promise);
		});

		test("Can map to a different type", () => {
			expect(map([1, 2, 3], (value) => String(value))).toEqual(["1", "2", "3"]);
		});

		test("Preserves the order of the list", () => {
			expect(map(["c", "a", "b"], (value) => value.toUpperCase())).toEqual(["C", "A", "B"]);
		});

		test("Keeps falsy mapped values", () => {
			const mapped = map([0, "", null, undefined, false, 0n], (value) => value);

			expect(mapped).toEqual([0, "", null, undefined, false, 0n]);
		});

		test("Does not flatten mapped arrays", () => {
			expect(map([1, 2], (value) => [value, value])).toEqual([
				[1, 1],
				[2, 2],
			]);
		});

		test("Callback receives the item, index and list", () => {
			const list = ["foo", "bar"];
			const callback = mock((value: string, index: number, source: readonly string[]) => [value, index, source]);

			map(list, callback);

			expect(callback).toHaveBeenNthCalledWith(1, "foo", 0, list);
			expect(callback).toHaveBeenNthCalledWith(2, "bar", 1, list);
		});

		test("Callback is invoked exactly once per item", () => {
			const callback = mock((value: number) => value);

			map([1, 2, 3, 4], callback);

			expect(callback).toBeCalledTimes(4);
		});

		test("Returns a new array", () => {
			const list = [1, 2, 3];

			expect(map(list, (value) => value)).not.toBe(list);
		});

		test("Does not mutate the original list", () => {
			const list = [1, 2, 3];

			map(list, (value) => value * 2);

			expect(list).toEqual([1, 2, 3]);
		});

		test("Throws if the callback throws", () => {
			expect(() =>
				map([1, 2, 3], (value) => {
					if (value === 2) {
						throw new Error("Oops");
					}

					return value;
				}),
			).toThrow("Oops");
		});

		test("Stops calling the callback once it throws", () => {
			const callback = mock((value: number) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return value;
			});

			expect(() => map([1, 2, 3, 4], callback)).toThrow();
			expect(callback).toBeCalledTimes(2);
		});
	});

	describe("async", () => {
		test("Returns a promise if the callback returns promises", () => {
			const mapped = map([1, 2, 3], async (value) => value);

			expect(mapped).toBeInstanceOf(Promise);
		});

		test("Resolves to the mapped values", async () => {
			expect(await map([1, 2, 3], async (value) => value * 2)).toEqual([2, 4, 6]);
		});

		test("Empty list resolves to an empty array", async () => {
			const callback = mock(async (value: number) => value);

			expect(await map([] as number[], callback)).toBeArrayOfSize(0);
			expect(callback).not.toBeCalled();
		});

		test("Preserves the order of the list regardless of when promises resolve", async () => {
			const mapped = await map([30, 10, 20], async (value) => {
				await sleep(value);

				return value;
			});

			expect(mapped).toEqual([30, 10, 20]);
		});

		test("Starts all callbacks without waiting for earlier ones to resolve", async () => {
			const callback = mock(async (value: number) => {
				await sleep(10);

				return value;
			});

			const mapped = map([1, 2, 3], callback);

			expect(callback).toBeCalledTimes(3);
			expect(await mapped).toEqual([1, 2, 3]);
		});

		test("Callback receives the item, index and list", async () => {
			const list = ["foo", "bar"];
			const callback = mock(async (value: string, index: number, source: readonly string[]) => [
				value,
				index,
				source,
			]);

			await map(list, callback);

			expect(callback).toHaveBeenNthCalledWith(1, "foo", 0, list);
			expect(callback).toHaveBeenNthCalledWith(2, "bar", 1, list);
		});

		test("Callback is invoked exactly once per item", async () => {
			const callback = mock(async (value: number) => value);

			await map([1, 2, 3, 4], callback);

			expect(callback).toBeCalledTimes(4);
		});

		test("Keeps falsy mapped values", async () => {
			const mapped = await map([0, "", null, undefined, false, 0n], async (value) => value);

			expect(mapped).toEqual([0, "", null, undefined, false, 0n]);
		});

		test("Does not mutate the original list", async () => {
			const list = [1, 2, 3];

			await map(list, async (value) => value * 2);

			expect(list).toEqual([1, 2, 3]);
		});

		test("Rejects if a promise rejects", async () => {
			const mapped = map([1, 2, 3], async (value) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return value;
			});

			await expect(mapped).rejects.toThrow("Oops");
		});
	});

	describe("mixed", () => {
		test("Returns a promise if only the first item is a promise", async () => {
			const mapped = map([1, 2, 3], (value) => (value === 1 ? Promise.resolve(value) : value));

			expect(mapped).toBeInstanceOf(Promise);
			expect(await mapped).toEqual([1, 2, 3]);
		});

		test("Returns a promise if only the last item is a promise", async () => {
			const mapped = map([1, 2, 3], (value) => (value === 3 ? Promise.resolve(value) : value));

			expect(mapped).toBeInstanceOf(Promise);
			expect(await mapped).toEqual([1, 2, 3]);
		});

		test("Preserves the order of the list", async () => {
			const mapped = await map([1, 2, 3, 4], (value) => (value % 2 === 0 ? sleep(10).then(() => value) : value));

			expect(mapped).toEqual([1, 2, 3, 4]);
		});

		test("Callback is invoked exactly once per item", async () => {
			const callback = mock((value: number) => (value === 2 ? Promise.resolve(value) : value));

			await map([1, 2, 3, 4], callback);

			expect(callback).toBeCalledTimes(4);
		});
	});

	describe("types", () => {
		const list: number[] = [];

		test("Sync callback returns an array", () => {
			expectTypeOf(map(list, (value) => value * 2)).toEqualTypeOf<number[]>();
		});

		test("Async callback returns a promisable array of the resolved type", () => {
			expectTypeOf(map(list, async (value) => String(value))).toEqualTypeOf<Promisable<string[]>>();
		});

		test("Mixed callback returns a promisable array of the resolved types", () => {
			expectTypeOf(map(list, (value) => (value > 0 ? Promise.resolve(value) : value))).toEqualTypeOf<
				Promisable<number[]>
			>();
			expectTypeOf(map(list, (value) => (value > 0 ? Promise.resolve("foo") : value))).toEqualTypeOf<
				Promisable<(string | number)[]>
			>();
		});
	});
});
