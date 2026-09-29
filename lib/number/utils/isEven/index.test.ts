import { describe, expect, test } from "bun:test";
import { isEven } from ".";

describe("isEven", () => {
	// Even numbers return true
	test.each([2, 4, 60, 174, 8991223104, -2, -4, -60, -174, -8991223104])("%d returns true", (value) => {
		expect(isEven(value)).toBeTrue();
	});

	// Odd and/or decimal numbers return false
	test.each([
		1, 3, 59, 173, 8991223103, -1, -3, -59, -173, -8991223103, 0.5, 1.5, 60.1, 20.001, 4201.3, -1.2, -4.62, 9.002,
	])("%d returns false", (value) => {
		expect(isEven(value)).toBeFalse();
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
