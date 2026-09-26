import { describe, expect, mock, test } from "bun:test";
import { max } from ".";

describe("max", () => {
	test("Simple max of number array", () => {
		const largest = max([3, 1, 2]);

		expect(largest).toBe(3);
	});

	test("Returns undefined for an empty array", () => {
		const largest = max([]);

		expect(largest).toBeUndefined();
	});

	test("Returns the only item for a single-item array", () => {
		const largest = max([5]);

		expect(largest).toBe(5);
	});

	test("Simple max of a number array with mapper", () => {
		const largest = max([1, 2, 3], (n) => n * -1);

		expect(largest).toBe(1);
	});

	test("Simple string array with mapper", () => {
		const mapper = mock((n) => Number.parseInt(n, 10));
		const largest = max(["3", "1", "2"], mapper);

		expect(largest).toBe("3");
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
		const largest = max(list);

		expect(largest).toBe(5);
	});

	test("Checks the list in descending direction", () => {
		const largest = max([1, 2, 3, 3], undefined, { direction: "DESCENDING" });

		expect(largest).toBe(3);
	});

	test("First equal value wins when checking ascending", () => {
		const first = {
			value: 1,
		};
		const second = {
			value: 1,
		};
		const largest = max([first, second], (item) => item.value);

		expect(largest).toBe(first);
	});

	test("Last equal value wins when checking descending", () => {
		const first = {
			value: 1,
		};
		const second = {
			value: 1,
		};
		const largest = max([first, second], (item) => item.value, { direction: "DESCENDING" });

		expect(largest).toBe(second);
	});

	test("Preserves the original array", () => {
		const list = [3, 4, 5];
		const largest = max(list);

		expect(list).toEqual([3, 4, 5]);
		expect(largest).toBe(5);

		const mappedLargest = max(list, (n) => n * -1);

		expect(list).toEqual([3, 4, 5]);
		expect(mappedLargest).toBe(3);
	});
});
