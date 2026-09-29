import { describe, expect, test } from "bun:test";
import { isPositive, positive } from ".";

describe("positive", () => {
	test("Negative number are converted into positive numbers", () => {
		expect(positive(-1)).toBe(1);
		expect(positive(-0.5)).toBe(0.5);
		expect(positive(Number.MIN_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
		expect(positive(-Infinity)).toBe(Infinity);
	});

	test("Positive numbers aren't changed", () => {
		expect(positive(1)).toBe(1);
		expect(positive(0.5)).toBe(0.5);
		expect(positive(0)).toBe(0);
		expect(positive(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
		expect(positive(Infinity)).toBe(Infinity);
	});

	test("Negative zero is converted into positive zero", () => {
		expect(positive(-0)).toBe(0);
	});
});

describe("isPositive", () => {
	// Positive values return true
	test.each([1, 0.5, 0, Number.MAX_SAFE_INTEGER, Infinity])("%d returns true", (value) => {
		expect(isPositive(value)).toBeTrue();
	});

	// Negative values return false
	test.each([-1, -0.5, Number.MIN_SAFE_INTEGER, -Infinity])("%d returns false", (value) => {
		expect(isPositive(value)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isPositive(NaN)).toBeFalse();
	});

	test("Negative zero is treated as a non-positive", () => {
		expect(isPositive(-0)).toBeFalse();
	});
});
