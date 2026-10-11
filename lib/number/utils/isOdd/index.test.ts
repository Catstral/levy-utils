import { describe, expect, test } from "bun:test";
import { isOdd } from ".";

describe("isOdd", () => {
	// Odd numbers return true
	test.each([[1, 3, 59, 173, 8991223103, -1, -3, -59, -173, -8991223103]])("%d returns true", (value) => {
		expect(isOdd(value)).toBeTrue();
	});

	// Even and/or decimal numbers return false
	test.each([-2, -4, -60, -174, -8991223104, 0.5, 1.5, 60.1, 20.001, 4201.3, -1.2, -4.62, 9.002])(
		"%d returns false",
		(value) => {
			expect(isOdd(value)).toBeFalse();
		},
	);

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
