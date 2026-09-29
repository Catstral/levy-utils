import { describe, expect, test } from "bun:test";
import { sign } from ".";

describe("sign", () => {
	// Positive numbers return positive one
	test.each([1, 0.5, Number.MAX_SAFE_INTEGER, Infinity])("%d returns positive one", (value) => {
		expect(sign(value)).toBe(1);
	});

	// Negative numbers return negative one
	test.each([-1, -0.5, Number.MIN_SAFE_INTEGER, -Infinity])("%d returns negative one", (value) => {
		expect(sign(value)).toBe(-1);
	});

	test("Positive zero returns zero", () => {
		expect(sign(0)).toBe(0);
	});

	test("Negative zero returns zero", () => {
		expect(sign(-0)).toBe(0);
	});

	test("NaN returns zero", () => {
		expect(sign(NaN)).toBe(0);
	});
});
