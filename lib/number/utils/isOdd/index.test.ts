import { describe, expect, test } from "bun:test";
import { isOdd } from ".";

describe("isOdd", () => {
	test("Positive odd numbers return true", () => {
		const values: number[] = [1, 3, 59, 173, 8991223103];

		for (const value of values) {
			expect(isOdd(value)).toBeTrue();
		}
	});

	test("Negative odd numbers return true", () => {
		const values: number[] = [-1, -3, -59, -173, -8991223103];

		for (const value of values) {
			expect(isOdd(value)).toBeTrue();
		}
	});

	test("Positive even numbers return false", () => {
		const values: number[] = [2, 4, 60, 174, 8991223104];

		for (const value of values) {
			expect(isOdd(value)).toBeFalse();
		}
	});

	test("Negative even numbers return false", () => {
		const values: number[] = [-2, -4, -60, -174, -8991223104];

		for (const value of values) {
			expect(isOdd(value)).toBeFalse();
		}
	});

	test("Decimal numbers return false", () => {
		const values: number[] = [0.5, 1.5, 60.1, 20.001, 4201.3, -1.2, -4.62, 9.002];

		for (const value of values) {
			expect(isOdd(value)).toBeFalse();
		}
	});

	test("Positive zero returns false", () => {
		expect(isOdd(0)).toBeFalse();
	});

	test("Negative zero returns false", () => {
		expect(isOdd(-0)).toBeFalse();
	});

	test("Positive infinity returns false", () => {
		expect(isOdd(Infinity)).toBeFalse();
	});

	test("Negative infinity returns false", () => {
		expect(isOdd(-Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isOdd(NaN)).toBeFalse();
	});
});
