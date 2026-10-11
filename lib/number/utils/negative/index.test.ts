import { describe, expect, test } from "bun:test";
import { isNegative, negative } from ".";

describe("negative", () => {
	test("Positive number are converted into negative numbers", () => {
		expect(negative(1)).toBe(-1);
		expect(negative(0.5)).toBe(-0.5);
		expect(negative(Number.MAX_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
		expect(negative(Infinity)).toBe(-Infinity);
	});

	test("Negative numbers aren't changed", () => {
		expect(negative(-1)).toBe(-1);
		expect(negative(-0.5)).toBe(-0.5);
		expect(negative(-0)).toBe(-0);
		expect(negative(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
		expect(negative(-Infinity)).toBe(-Infinity);
	});

	test("Positive zero is converted into negative zero", () => {
		expect(negative(0)).toBe(-0);
	});
});

describe("isNegative", () => {
	test("Negative values return true", () => {
		expect(isNegative(-1)).toBeTrue();
		expect(isNegative(-0.5)).toBeTrue();
		expect(isNegative(Number.MIN_SAFE_INTEGER)).toBeTrue();
		expect(isNegative(-Infinity)).toBeTrue();
	});

	test("Positive values return false", () => {
		expect(isNegative(1)).toBeFalse();
		expect(isNegative(0.5)).toBeFalse();
		expect(isNegative(0)).toBeFalse();
		expect(isNegative(Number.MAX_SAFE_INTEGER)).toBeFalse();
		expect(isNegative(Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isNegative(NaN)).toBeFalse();
	});

	test("Minus zero is treated as a negative number", () => {
		expect(isNegative(-0)).toBeTrue();
	});
});
