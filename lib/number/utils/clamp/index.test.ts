import { describe, expect, test } from "bun:test";
import { clamp } from ".";

describe("clamp", () => {
	test("Value isn't clamped when between minimum and maximum", () => {
		expect(clamp(-5, 0, 5)).toBe(0);
	});

	test("Clamps to the minimum value", () => {
		expect(clamp(-5, -10, 5)).toBe(-5);
	});

	test("Clamps to the maximum value", () => {
		expect(clamp(-5, 10, 5)).toBe(5);
	});

	test("Value remains the same if same as minimum or maximum", () => {
		expect(clamp(-5, -5, 5)).toBe(-5);
		expect(clamp(-5, 5, 5)).toBe(5);
		expect(clamp(0, 0, 0)).toBe(0);
	});

	// Returns NaN if any argument is NaN
	test.each<Parameters<typeof clamp>>([
		[NaN, 0, 5],
		[-5, NaN, 5],
		[-5, 0, NaN],
		[-5, NaN, NaN],
		[NaN, 0, NaN],
		[NaN, NaN, 5],
		[NaN, NaN, NaN],
	])("Returns NaN if any argument of [%d, %d, %d] is NaN", (min, value, max) => {
		expect(clamp(min, value, max)).toBeNaN();
	});

	test("Returns NaN when minimum and maximum contradict each other", () => {
		expect(clamp(5, 0, -5)).toBeNaN();
	});
});
