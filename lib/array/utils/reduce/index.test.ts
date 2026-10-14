import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import { reduce } from ".";

describe("reduce", () => {
	test("Accumulates a result from every item of a list", () => {
		expect(reduce([1, 2, 3, 4], 0, (acc, value) => acc + value)).toBe(10);
	});

	test("Empty list returns the initial value", () => {
		const callback = mock((acc: number, value: number) => acc + value);

		expect(reduce([], 0, callback)).toBe(0);
		expect(callback).not.toBeCalled();
	});

	test("Can accumulate into a different type", () => {
		expect(reduce([1, 2, 3], "", (acc, value) => acc + String(value))).toBe("123");
	});

	test("Preserves the order of the list by default", () => {
		expect(reduce(["a", "b", "c"], "", (acc, value) => acc + value)).toBe("abc");
	});

	test("Callback receives the accumulator, item, index and list", () => {
		const list = ["foo", "bar"];
		const callback = mock((acc: string[], value: string, index: number, source: readonly string[]) => [
			...acc,
			`${value}-${index}-${source.length}`,
		]);

		reduce(list, [] as string[], callback);

		expect(callback).toHaveBeenNthCalledWith(1, [], "foo", 0, list);
		expect(callback).toHaveBeenNthCalledWith(2, ["foo-0-2"], "bar", 1, list);
	});

	test("Callback is invoked exactly once per item", () => {
		const callback = mock((acc: number, value: number) => acc + value);

		reduce([1, 2, 3, 4], 0, callback);

		expect(callback).toBeCalledTimes(4);
	});

	test("Does not mutate the original list", () => {
		const list = [1, 2, 3];

		reduce(list, 0, (acc, value) => acc + value);

		expect(list).toEqual([1, 2, 3]);
	});

	test("Throws if the callback throws", () => {
		expect(() =>
			reduce([1, 2, 3], 0, (acc, value) => {
				if (value === 2) {
					throw new Error("Oops");
				}

				return acc + value;
			}),
		).toThrow("Oops");
	});

	test("Stops calling the callback once it throws", () => {
		const callback = mock((acc: number, value: number) => {
			if (value === 2) {
				throw new Error("Oops");
			}

			return acc + value;
		});

		expect(() => reduce([1, 2, 3, 4], 0, callback)).toThrow();
		expect(callback).toBeCalledTimes(2);
	});

	describe("direction", () => {
		test("Defaults to ascending order", () => {
			expect(reduce(["a", "b", "c"], "", (acc, value) => acc + value)).toBe("abc");
		});

		test("Iterates in ascending order when explicitly set", () => {
			const reduced = reduce(["a", "b", "c"], "", (acc, value) => acc + value, { direction: "ASCENDING" });

			expect(reduced).toBe("abc");
		});

		test("Iterates in descending order", () => {
			const reduced = reduce(["a", "b", "c"], "", (acc, value) => acc + value, { direction: "DESCENDING" });

			expect(reduced).toBe("cba");
		});

		test("Passes the original (unreversed) index when iterating in descending order", () => {
			const list = ["a", "b", "c"];
			const callback = mock((acc: string[], value: string, index: number) => [...acc, `${value}${index}`]);

			reduce(list, [] as string[], callback, { direction: "DESCENDING" });

			expect(callback).toHaveBeenNthCalledWith(1, [], "c", 2, list);
			expect(callback).toHaveBeenNthCalledWith(2, ["c2"], "b", 1, list);
			expect(callback).toHaveBeenNthCalledWith(3, ["c2", "b1"], "a", 0, list);
		});

		test("Empty list with a descending direction returns the initial value", () => {
			const callback = mock((acc: number, value: number) => acc + value);

			const reduced = reduce([], 0, callback, { direction: "DESCENDING" });

			expect(reduced).toBe(0);
			expect(callback).not.toBeCalled();
		});
	});

	describe("result", () => {
		test("Transforms the accumulator into the final result", () => {
			expect(
				reduce([1, 2, 3], 0, (acc, value) => acc + value, {
					result: (acc) => `Total: ${acc}`,
				}),
			).toBe("Total: 6");
		});

		test("Is called exactly once with the final accumulator", () => {
			const result = mock((acc: number) => acc * 2);

			reduce([1, 2, 3], 0, (acc: number, value: number) => acc + value, { result });

			expect(result).toBeCalledTimes(1);
			expect(result).toHaveBeenNthCalledWith(1, 6);
		});

		test("Is called with the initial value for an empty list", () => {
			const result = mock((acc: number) => acc * 2);

			expect(reduce([], 5, (acc: number, value: number) => acc + value, { result })).toBe(10);
			expect(result).toHaveBeenNthCalledWith(1, 5);
		});

		test("Is not called when omitted", () => {
			const reduced = reduce([1, 2, 3], 0, (acc, value) => acc + value, {});

			expect(reduced).toBe(6);
		});
	});

	describe("types", () => {
		const list: number[] = [];

		test("Returns the accumulator type", () => {
			expectTypeOf(reduce(list, 0, (acc, value) => acc + value)).toEqualTypeOf<number>();
		});

		test("Returns the transformed result type when `result` is provided", () => {
			expectTypeOf(
				reduce(list, 0, (acc, value) => acc + value, { result: (acc) => String(acc) }),
			).toEqualTypeOf<string>();
		});
	});
});
