import { describe, expect, test } from "bun:test";
import { random } from ".";

describe("random", () => {
	test("Returns a value between 0 and 1 when no arguments are given", () => {
		const value = random();

		expect(value).toBeGreaterThan(0);
		expect(value).toBeLessThan(1);
	});

	test("Returns a value between specified min value and max value", () => {
		const min = 10;
		const max = 20;

		const value = random(min, max);

		expect(value).toBeGreaterThan(min);
		expect(value).toBeLessThan(max);
	});

	test("Returns the same value as min and max if min and max value are the same", () => {
		const limit = 10;

		const value = random(limit, limit);

		expect(value).toBe(limit);
	});

	test("Returns NaN if the min and max value contradict", () => {
		const min = 20;
		const max = 10;

		const value = random(min, max);

		expect(value).toBeNaN();
	});
});
