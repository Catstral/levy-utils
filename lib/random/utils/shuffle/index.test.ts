import { describe, expect, test } from "bun:test";
import { shuffle } from ".";

describe("shuffle", () => {
	test("Returns an array", () => {
		const list = [0, 1, 2, 3, 4, 5];
		const shuffled = shuffle(list);

		expect(shuffled).toBeArray();
	});

	test("Returns an array of the same length", () => {
		const list = [0, 1, 2, 3, 4, 5];
		const shuffled = shuffle(list);

		expect(shuffled).toHaveLength(list.length);
	});

	test("Leaves the input unmodified", () => {
		const list = [0, 1, 2, 3, 4, 5];
		shuffle(list);

		expect(list).toEqual([0, 1, 2, 3, 4, 5]);
	});

	test("Every number exists in the before only once", () => {
		const list = [0, 1, 2, 3, 4, 5];
		const shuffled = shuffle(list);

		const checked: number[] = [];

		for (const item of shuffled) {
			expect(list).toContain(item);
			expect(checked).not.toContain(item);

			checked.push(item);
		}
	});
});
