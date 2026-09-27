import { describe, expect, test } from "bun:test";
import { isEven } from ".";

describe("isEven", () => {
	test("Positive even numbers return true", () => {
		const values: number[] = [2, 4, 60, 174, 8991223104];

		for (const value of values) {
			expect(isEven(value)).toBeTrue();
		}
	});

	test("Negative even numbers return true", () => {
		const values: number[] = [-2, -4, -60, -174, -8991223104];

		for (const value of values) {
			expect(isEven(value)).toBeTrue();
		}
	});

	test("Positive odd numbers return false", () => {
		const values: number[] = [1, 3, 59, 173, 8991223103];

		for (const value of values) {
			expect(isEven(value)).toBeFalse();
		}
	});

	test("Negative odd numbers return false", () => {
		const values: number[] = [-1, -3, -59, -173, -8991223103];

		for (const value of values) {
			expect(isEven(value)).toBeFalse();
		}
	});

	test("Decimal numbers return false", () => {
		const values: number[] = [0.5, 1.5, 60.1, 20.001, 4201.3, -1.2, -4.62, 9.002];

		for (const value of values) {
			expect(isEven(value)).toBeFalse();
		}
	});

	test("Positive zero returns true", () => {
		expect(isEven(0)).toBeTrue();
	});

	test("Negative zero returns true", () => {
		expect(isEven(-0)).toBeTrue();
	});

	test("Positive infinity returns false", () => {
		expect(isEven(Infinity)).toBeFalse();
	});

	test("Negative infinity returns false", () => {
		expect(isEven(-Infinity)).toBeFalse();
	});

	test("NaN returns false", () => {
		expect(isEven(NaN)).toBeFalse();
	});
});
