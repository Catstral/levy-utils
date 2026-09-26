import { describe, expect, mock, test } from "bun:test";
import { min } from ".";

describe("min", () => {
	test("Simple min of number array", () => {
		const smallest = min([3, 1, 2]);

		expect(smallest).toBe(1);
	});

	test("Returns undefined for an empty array", () => {
		const smallest = min([]);

		expect(smallest).toBeUndefined();
	});

	test("Returns the only item for a single-item array", () => {
		const smallest = min([5]);

		expect(smallest).toBe(5);
	});

	test("Simple min of a number array with mapper", () => {
		const smallest = min([1, 2, 3], (n) => n * -1);

		expect(smallest).toBe(3);
	});

	test("Simple string array with mapper", () => {
		const mapper = mock((n) => Number.parseInt(n, 10));
		const smallest = min(["3", "1", "2"], mapper);

		expect(smallest).toBe("1");
		expect(mapper).toBeCalledTimes(3);

		const calls = mapper.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(3);
		expect(calls[1].value).toBe(1);
		expect(calls[2].value).toBe(2);
	});

	test("Non-numeric values are ignored when no mapper is provided", () => {
		const list = ["", false, null, undefined, "Hello", true, [], {}, new Date(), 5];
		const smallest = min(list);

		expect(smallest).toBe(5);
	});

	test("Checks the list in descending direction", () => {
		const smallest = min([1, 2, 3, 1], undefined, { direction: "DESCENDING" });

		expect(smallest).toBe(1);
	});

	test("First equal value wins when checking ascending", () => {
		const first = {
			value: 1,
		};
		const second = {
			value: 1,
		};
		const smallest = min([first, second], (item) => item.value);

		expect(smallest).toBe(first);
	});

	test("Last equal value wins when checking descending", () => {
		const first = {
			value: 1,
		};
		const second = {
			value: 1,
		};
		const smallest = min([first, second], (item) => item.value, { direction: "DESCENDING" });

		expect(smallest).toBe(second);
	});

	test("Preserves the original array", () => {
		const list = [3, 4, 5];
		const smallest = min(list);

		expect(list).toEqual([3, 4, 5]);
		expect(smallest).toBe(3);

		const mappedSmallest = min(list, (n) => n * -1);

		expect(list).toEqual([3, 4, 5]);
		expect(mappedSmallest).toBe(5);
	});
});
