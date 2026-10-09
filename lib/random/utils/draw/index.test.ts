import { describe, expect, test } from "bun:test";
import { draw } from ".";

describe("draw", () => {
	test("Returns a value from inside the given list", () => {
		const list = [0, 1, 2, 3, 4, 5] as const;
		const drawn = draw(list);

		expect(list).toContain(drawn);
	});

	test("Returns undefined if an empty array is given", () => {
		const list = [] as const;
		const drawn = draw(list);

		expect(drawn).toBe(undefined);
	});

	test("Leaves the input unmodified", () => {
		const list = [0, 1, 2, 3, 4, 5];
		draw(list);

		expect(list).toEqual([0, 1, 2, 3, 4, 5]);
	});
});
