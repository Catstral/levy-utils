import { describe, expect, test } from "bun:test";
import { clamp } from ".";

describe("clamp", () => {
	test("Value isn't clamped when between minimum and maximum", () => {
		const result = clamp(-5, 0, 5);

		expect(result).toBe(0);
	});

	test("Clamps to the minimum value", () => {
		const result = clamp(-5, -10, 5);

		expect(result).toBe(-5);
	});

	test("Clamps to the maximum value", () => {
		const result = clamp(-5, 10, 5);

		expect(result).toBe(5);
	});

	test("Value remains the same if same as minimum or maximum", () => {
		expect(clamp(-5, -5, 5)).toBe(-5);
		expect(clamp(-5, 5, 5)).toBe(5);
		expect(clamp(0, 0, 0)).toBe(0);
	});

	test("Returns NaN if any argument is NaN", () => {
		expect(clamp(NaN, 0, 5)).toBeNaN();
		expect(clamp(-5, NaN, 5)).toBeNaN();
		expect(clamp(-5, 0, NaN)).toBeNaN();
		expect(clamp(-5, NaN, NaN)).toBeNaN();
		expect(clamp(NaN, 0, NaN)).toBeNaN();
		expect(clamp(NaN, NaN, 5)).toBeNaN();
		expect(clamp(NaN, NaN, NaN)).toBeNaN();
	});

	test("Returns NaN when minimum and maximum contradict each other", () => {
		const result = clamp(5, 0, -5);

		expect(result).toBeNaN();
	});
});
