import { describe, expect, test } from "bun:test";
import { scatter } from ".";

describe("scatter", () => {
	test("Splits the given list with the original items", () => {
		const list = [0, 1, 2, 3, 4, 5] as const;
		const scattered = scatter(list);

		for (const item of scattered[0]) {
			expect(list).toContain(item);
		}

		for (const item of scattered[1]) {
			expect(list).toContain(item);
		}
	});

	test("Splits the given list 50/50 if no split is defined", () => {
		const list = [0, 1, 2, 3, 4, 5] as const;
		const scattered = scatter(list);

		expect(scattered[0]).toBeArrayOfSize(3);
		expect(scattered[1]).toBeArrayOfSize(3);
	});

	test("Splits the given list 80/20", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 0.8);

		expect(scattered[0]).toBeArrayOfSize(4);
		expect(scattered[1]).toBeArrayOfSize(1);
	});

	test("Splits empty array into 2 empty arrays", () => {
		const list = [] as const;
		const scattered = scatter(list);

		expect(scattered).toBeArrayOfSize(2);

		expect(scattered[0]).toBeArrayOfSize(0);
		expect(scattered[1]).toBeArrayOfSize(0);
	});

	test("Splits a list of 5 items 3-2 with 50/50 split and bias ROUND", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 0.5, {
			bias: "ROUND",
		});

		expect(scattered[0]).toBeArrayOfSize(3);
		expect(scattered[1]).toBeArrayOfSize(2);
	});

	test("Splits a list of 5 items 2-3 with 50/50 split and bias FLOOR", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 0.5, {
			bias: "FLOOR",
		});

		expect(scattered[0]).toBeArrayOfSize(2);
		expect(scattered[1]).toBeArrayOfSize(3);
	});

	test("Splits a list of 5 items 3-2 with 50/50 split and bias CEIL", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 0.5, {
			bias: "CEIL",
		});

		expect(scattered[0]).toBeArrayOfSize(3);
		expect(scattered[1]).toBeArrayOfSize(2);
	});

	test("Returns the entire list in first item if split is 1", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 1);

		expect(scattered[0]).toBeArrayOfSize(5);
		expect(scattered[1]).toBeArrayOfSize(0);
	});

	test("Returns the entire list in first item if split is more than 1", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 10);

		expect(scattered[0]).toBeArrayOfSize(5);
		expect(scattered[1]).toBeArrayOfSize(0);
	});

	test("Returns the entire list in first item if split is 0", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, 0);

		expect(scattered[0]).toBeArrayOfSize(0);
		expect(scattered[1]).toBeArrayOfSize(5);
	});

	test("Returns the entire list in first item if split is less than 0", () => {
		const list = [0, 1, 2, 3, 4] as const;
		const scattered = scatter(list, -1);

		expect(scattered[0]).toBeArrayOfSize(0);
		expect(scattered[1]).toBeArrayOfSize(5);
	});
});
