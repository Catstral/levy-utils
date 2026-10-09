import { describe, expect, test } from "bun:test";
import { OverflowUtilError, overflow } from ".";

describe("overflow", () => {
	test("Splits a list into a clamped and rest list", () => {
		const [clamped, rest] = overflow([0, 1, 2, 3, 4], 2);

		expect(clamped).toEqual([0, 1]);
		expect(rest).toEqual([2, 3, 4]);
	});

	test("A clamp length of 0 puts every item in the rest list", () => {
		const [clamped, rest] = overflow([0, 1, 2], 0);

		expect(clamped).toBeArrayOfSize(0);
		expect(rest).toEqual([0, 1, 2]);
	});

	test("A clamp length equal to the list length puts every item in the clamped list", () => {
		const [clamped, rest] = overflow([0, 1, 2], 3);

		expect(clamped).toEqual([0, 1, 2]);
		expect(rest).toBeArrayOfSize(0);
	});

	test("A clamp length longer than the list length puts every item in the clamped list", () => {
		const [clamped, rest] = overflow([0, 1, 2], 10);

		expect(clamped).toEqual([0, 1, 2]);
		expect(rest).toBeArrayOfSize(0);
	});

	test("Empty list returns 2 empty lists", () => {
		const [clamped, rest] = overflow([], 3);

		expect(clamped).toBeArrayOfSize(0);
		expect(rest).toBeArrayOfSize(0);
	});

	test("Preserves the order of the list", () => {
		const [clamped, rest] = overflow([5, 2, 4, 1, 3], 2);

		expect(clamped).toEqual([5, 2]);
		expect(rest).toEqual([4, 1, 3]);
	});

	test("A negative clamp length throws an OverflowUtilError", () => {
		try {
			overflow([0, 1, 2], -1);
			expect().fail("Invalid clamp length definition passed to overflow");
		} catch (err) {
			expect(err).toBeInstanceOf(OverflowUtilError);
			expect((err as OverflowUtilError).util).toBe("overflow");
			expect((err as OverflowUtilError).message).toBe("Clamp length cannot be smaller than 0");
		}
	});

	test("Non-array list throws an OverflowUtilError", () => {
		try {
			overflow("" as unknown as string[], 1);
			expect().fail("Invalid list definition passed to overflow");
		} catch (err) {
			expect(err).toBeInstanceOf(OverflowUtilError);
			expect((err as OverflowUtilError).util).toBe("overflow");
			expect((err as OverflowUtilError).message).toBe("List must be an array");
		}
	});

	test("Null list throws an OverflowUtilError", () => {
		try {
			overflow(null as unknown as number[], 1);
			expect().fail("Null list definition passed to overflow");
		} catch (err) {
			expect(err).toBeInstanceOf(OverflowUtilError);
			expect((err as OverflowUtilError).util).toBe("overflow");
			expect((err as OverflowUtilError).message).toBe("List must be an array");
		}
	});

	test("Returns new arrays", () => {
		const list = [0, 1, 2, 3];
		const [clamped, rest] = overflow(list, 2);

		expect(clamped).not.toBe(list);
		expect(rest).not.toBe(list);
	});

	test("Does not mutate the original list", () => {
		const list = [0, 1, 2, 3];

		overflow(list, 2);

		expect(list).toEqual([0, 1, 2, 3]);
	});
});
