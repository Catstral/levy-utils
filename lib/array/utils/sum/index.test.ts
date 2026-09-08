import { describe, expect, mock, test } from "bun:test";
import { sum } from ".";

describe("sum", () => {
	test("Simple sum of number array", () => {
		const total = sum([1, 2, 3]);

		expect(total).toBe(6);
	});

	test("Simple sum of a number array with mapper", () => {
		const total = sum([1, 2, 3], (n) => n * 2);

		expect(total).toBe(12);
	});

	test("Simple string array with mapper", () => {
		const mapper = mock((n) => Number.parseInt(n, 10));
		const total = sum(["1", "2", "3"], mapper);

		expect(total).toBe(6);
		expect(mapper).toBeCalledTimes(3);

		const calls = mapper.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(1);
		expect(calls[1].value).toBe(2);
		expect(calls[2].value).toBe(3);
	});

	test("Non-numeric values only count if mapped to a number", () => {
		const list = ["", false, null, undefined, "Hello", true, [], {}, new Date()];
		const total = sum(list);

		expect(total).toBe(0);

		const mappedTotal = sum(list, (item) => (item ? 1 : 0));

		expect(mappedTotal).toBe(5);
	});

	test("Preserves the original array", () => {
		const list = [3, 4, 5];
		const total = sum(list);

		expect(list).toEqual([3, 4, 5]);
		expect(total).toBe(12);

		const mappedTotal = sum(list, (n) => n * 2);

		expect(list).toEqual([3, 4, 5]);
		expect(mappedTotal).toBe(24);
	});
});
