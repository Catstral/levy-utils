import { describe, expect, expectTypeOf, test } from "bun:test";
import { isArray } from ".";

describe("isArray", () => {
	test("Returns true for an empty array", () => {
		expect(isArray([])).toBeTrue();
	});

	test("Returns true for an array with items", () => {
		expect(isArray([1, 2, 3])).toBeTrue();
	});

	test("Returns false for a string", () => {
		expect(isArray("array")).toBeFalse();
	});

	test("Returns false for a number", () => {
		expect(isArray(1)).toBeFalse();
	});

	test("Returns false for an object", () => {
		expect(isArray({ length: 0 })).toBeFalse();
	});

	test("Returns false for null", () => {
		expect(isArray(null)).toBeFalse();
	});

	test("Returns false for undefined", () => {
		expect(isArray(undefined)).toBeFalse();
	});

	test("Returns false for a function", () => {
		expect(isArray(() => {})).toBeFalse();
	});

	test("Returns true for array-like objects created via Array", () => {
		expect(isArray(Array.from({ length: 3 }))).toBeTrue();
	});

	describe("types", () => {
		test("Narrows an unknown value to an unknown array", () => {
			const value: unknown = [1, 2, 3];

			if (isArray(value)) {
				expectTypeOf(value).toEqualTypeOf<unknown[]>();
			}
		});
	});
});
