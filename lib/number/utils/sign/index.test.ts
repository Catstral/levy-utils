import { describe, expect, test } from "bun:test";
import { sign } from ".";

describe("positive", () => {
	test("Positive numbers return positive one", () => {
		const values: number[] = [1, 0.5, Number.MAX_SAFE_INTEGER, Infinity];

		for (const value of values) {
			expect(sign(value)).toBe(1);
		}
	});

	test("Negative numbers return negative one", () => {
		const values: number[] = [-1, -0.5, Number.MIN_SAFE_INTEGER, -Infinity];

		for (const value of values) {
			expect(sign(value)).toBe(-1);
		}
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
