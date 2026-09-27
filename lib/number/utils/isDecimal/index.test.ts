import { describe, expect, test } from "bun:test";
import { isDecimal } from ".";

describe("isDecimal", () => {
	test("Positive decimal numbers return true", () => {
		const values: number[] = [0.1, 0.5, 0.002, 1.1, 17.3, 208.7, 7261.59];

		for (const value of values) {
			expect(isDecimal(value)).toBeTrue();
		}
	});

	test("Negative decimal numbers return true", () => {
		const values: number[] = [-0.1, -0.5, -0.002, -1.1, -17.3, -208.7, -7261.59];

		for (const value of values) {
			expect(isDecimal(value)).toBeTrue();
		}
	});

	test("Positive non-decimal numbers return false", () => {
		const values: number[] = [1, 2, 13, 109, 6218, Number.MAX_SAFE_INTEGER];

		for (const value of values) {
			expect(isDecimal(value)).toBeFalse();
		}
	});

	test("Negative non-decimal numbers return false", () => {
		const values: number[] = [-1, -2, -13, -109, -6218, Number.MIN_SAFE_INTEGER];

		for (const value of values) {
			expect(isDecimal(value)).toBeFalse();
		}
	});

	test("Positive zero returns false", () => {
		expect(isDecimal(0)).toBeFalse();
	});

	test("Negative zero returns false", () => {
		expect(isDecimal(-0)).toBeFalse();
	});

	test("Positive infinity returns false", () => {
		expect(isDecimal(Infinity)).toBeFalse();
	});

	test("Negative infinity returns false", () => {
		expect(isDecimal(-Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isDecimal(NaN)).toBeFalse();
	});
});
