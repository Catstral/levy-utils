import { describe, expect, test } from "bun:test";
import { isDecimal } from ".";

describe("isDecimal", () => {
	// Decimal numbers return true
	test.each([0.1, 0.5, 0.002, 1.1, 17.3, 208.7, 7261.59, -0.1, -0.5, -0.002, -1.1, -17.3, -208.7, -7261.59])(
		"%d returns true",
		(value) => {
			expect(isDecimal(value)).toBeTrue();
		},
	);

	// Non-decimal numbers return false
	test.each([1, 2, 13, 109, 6218, Number.MAX_SAFE_INTEGER, -1, -2, -13, -109, -6218, Number.MIN_SAFE_INTEGER])(
		"%d returns false",
		(value) => {
			expect(isDecimal(value)).toBeFalse();
		},
	);

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
