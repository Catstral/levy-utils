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

	test("NaN falls back to zero", () => {
		expect(positive(NaN)).toBe(0);
	})

	test("Negative zero is converted into positive zero", () => {
		expect(positive(-0)).toBe(0);
	})
})

describe("isPositive", () => {
	test("Positive values return true", () => {
		expect(isPositive(1)).toBeTrue();
		expect(isPositive(0.5)).toBeTrue();
		expect(isPositive(0)).toBeTrue();
		expect(isPositive(Number.MAX_SAFE_INTEGER)).toBeTrue();
		expect(isPositive(Infinity)).toBeTrue();
	});

	test("Negative values return false", () => {
		expect(isPositive(-1)).toBeFalse();
		expect(isPositive(-0.5)).toBeFalse();
		expect(isPositive(Number.MIN_SAFE_INTEGER)).toBeFalse();
		expect(isPositive(-Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isPositive(NaN)).toBeFalse();
	});

	test("Minus zero is treated as a non-positive", () => {
		expect(isPositive(-0)).toBeFalse();
	})
})
