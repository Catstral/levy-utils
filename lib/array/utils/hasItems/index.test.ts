import { describe, expect, expectTypeOf, test } from "bun:test";
import { hasItems } from ".";

describe("hasItems", () => {
	test("Returns true for a list with one item", () => {
		expect(hasItems([1])).toBeTrue();
	});

	test("Returns true for a list with multiple items", () => {
		expect(hasItems([1, 2, 3])).toBeTrue();
	});

	test("Returns false for an empty list", () => {
		expect(hasItems([])).toBeFalse();
	});

	test("Returns true for falsy items", () => {
		expect(hasItems([0, "", null, undefined, false])).toBeTrue();
	});

	test("Works with a readonly list", () => {
		const list: readonly number[] = [1, 2, 3];

		expect(hasItems(list)).toBeTrue();
	});

	test("Does not mutate the original list", () => {
		const list = [1, 2, 3];

		hasItems(list);

		expect(list).toEqual([1, 2, 3]);
	});

	describe("types", () => {
		test("Narrows a mutable list to a non-empty tuple", () => {
			const list: number[] = [1, 2, 3];

			if (hasItems(list)) {
				expectTypeOf(list).toEqualTypeOf<[number, ...number[]]>();
			}
		});

		test("Narrows a readonly list to a readonly non-empty tuple", () => {
			const list: readonly number[] = [1, 2, 3];

			if (hasItems(list)) {
				expectTypeOf(list).toEqualTypeOf<readonly [number, ...number[]]>();
			}
		});
	});
});
