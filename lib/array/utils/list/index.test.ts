import { describe, expect, test } from "bun:test";
import { ListUtilError, list } from ".";

describe("list", () => {
	test("Simple list", () => {
		expect(list(4)).toEqual([0, 1, 2, 3, 4]);
	});

	test("Simple list with end", () => {
		expect(list(0, 4)).toEqual([0, 1, 2, 3, 4]);
	});

	test("Simple list with start and end", () => {
		expect(list(2, 4)).toEqual([2, 3, 4]);
	});

	test("Simple list with step", () => {
		expect(
			list(0, 4, {
				step: 2,
			}),
		).toEqual([0, 2, 4]);
	});

	test("Simple list with mapping literal", () => {
		expect(
			list(0, 4, {
				valueMapper: "foo",
			}),
		).toEqual(["foo", "foo", "foo", "foo", "foo"]);
	});

	test("Simple list with mapping function", () => {
		expect(
			list(0, 4, {
				valueMapper: (step) => `foo-${step}`,
			}),
		).toEqual(["foo-0", "foo-1", "foo-2", "foo-3", "foo-4"]);
	});

	test("Simple list with mapping literal and step", () => {
		expect(
			list(0, 8, {
				step: 2,
				valueMapper: "foo",
			}),
		).toEqual(["foo", "foo", "foo", "foo", "foo"]);
	});

	test("Simple list with mapping function and step", () => {
		expect(
			list(0, 8, {
				step: 2,
				valueMapper: (step) => `foo-${step}`,
			}),
		).toEqual(["foo-0", "foo-2", "foo-4", "foo-6", "foo-8"]);
	});

	test("Zero-length list", () => {
		expect(list(0)).toEqual([0]);
	});

	test("List where start equals end", () => {
		expect(list(3, 3)).toEqual([3]);
	});

	test("List with negative start and end", () => {
		expect(list(-3, -1)).toEqual([-3, -2, -1]);
	});

	test("List with a non-integer step", () => {
		expect(
			list(0, 2, {
				step: 0.5,
			}),
		).toEqual([0, 0.5, 1, 1.5, 2]);
	});

	test("List with a length and options only (no explicit end)", () => {
		expect(
			list(4, undefined, {
				step: 2,
			}),
		).toEqual([0, 2, 4]);
	});

	test("Descending list (start greater than end)", () => {
		expect(list(4, 0)).toEqual([4, 3, 2, 1, 0]);
	});

	test("Descending list with a matching negative step", () => {
		expect(
			list(6, 0, {
				step: -2,
			}),
		).toEqual([6, 4, 2, 0]);
	});

	test("Descending list with a mapping function", () => {
		expect(
			list(2, 0, {
				valueMapper: (step) => `foo-${step}`,
			}),
		).toEqual(["foo-2", "foo-1", "foo-0"]);
	});

	test("Returns a plain array", () => {
		expect(Array.isArray(list(3))).toBe(true);
	});

	test("A list with a step of zero throws a ListUtilError", () => {
		try {
			list(0, 2, {
				step: 0,
			});
			expect().fail("Expected list to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(ListUtilError);
			expect((err as ListUtilError).util).toBe("list");
			expect((err as ListUtilError).message).toBe(
				"Step cannot be 0, that would cause the list to become infinite",
			);
		}
	});

	test("An ascending list with a negative step throws a ListUtilError", () => {
		try {
			list(0, 4, {
				step: -1,
			});
			expect().fail("Expected list to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(ListUtilError);
			expect((err as ListUtilError).util).toBe("list");
			expect((err as ListUtilError).message).toBe(
				"Given start and end should cause the list to traverse positively, but step is specified to traverse negatively",
			);
		}
	});

	test("A descending list with a positive step throws a ListUtilError", () => {
		try {
			list(4, 0, {
				step: 1,
			});
			expect().fail("Expected list to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(ListUtilError);
			expect((err as ListUtilError).util).toBe("list");
			expect((err as ListUtilError).message).toBe(
				"Given start and end should cause the list to traverse negatively, but step is specified to traverse positively",
			);
		}
	});
});
