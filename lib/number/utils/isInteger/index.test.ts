import { describe, expect, test } from "bun:test";
import { isInteger } from ".";

describe("isDecimal", () => {
	test("Positive non-decimal numbers return true", () => {
		const values: number[] = [1, 2, 13, 109, 6218, Number.MAX_SAFE_INTEGER];

		for (const value of values) {
			expect(isInteger(value)).toBeTrue();
		}
	});

	test("Negative non-decimal numbers return true", () => {
		const values: number[] = [-1, -2, -13, -109, -6218, Number.MIN_SAFE_INTEGER];

		for (const value of values) {
			expect(isInteger(value)).toBeTrue();
		}
	});

	test("Positive decimal numbers return false", () => {
		const values: number[] = [0.1, 0.5, 0.002, 1.1, 17.3, 208.7, 7261.59];

		for (const value of values) {
			expect(isInteger(value)).toBeFalse();
		}
	});

	test("Negative decimal numbers return false", () => {
		const values: number[] = [-0.1, -0.5, -0.002, -1.1, -17.3, -208.7, -7261.59];

		for (const value of values) {
			expect(isInteger(value)).toBeFalse();
		}
	});

	test("Positive zero returns true", () => {
		expect(isInteger(0)).toBeTrue();
	});

	test("Negative zero returns true", () => {
		expect(isInteger(-0)).toBeTrue();
	});

	test("Positive infinity returns false", () => {
		expect(isInteger(Infinity)).toBeFalse();
	});

	test("Negative infinity returns false", () => {
		expect(isInteger(-Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isInteger(NaN)).toBeFalse();
	});
});
