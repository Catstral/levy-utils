import { describe, expect, test } from "bun:test";
import { mod } from ".";

describe("mod", () => {
	test("Returns zero when the dividend is zero", () => {
		expect(mod(0, 2)).toBe(0);
	});

	test("Returns the dividend when it is smaller than the divisor", () => {
		expect(mod(3, 5)).toBe(3);
	});

	test("Returns the remainder when the dividend is larger than the divisor", () => {
		expect(mod(7, 5)).toBe(2);
	});

	test("Returns zero when the dividend is evenly divisible by the divisor", () => {
		expect(mod(10, 5)).toBe(0);
	});

	test("Returns a positive result for a negative dividend", () => {
		expect(mod(-3, 5)).toBe(2);
	});

	test("Returns zero for a negative dividend that is evenly divisible", () => {
		expect(mod(-10, 5)).toBe(0);
	});

	test("Negative divisor", () => {
		expect(mod(3, -5)).toBe(-2);
		expect(mod(7, -5)).toBe(-3);
		expect(mod(2, -5)).toBe(-3);
		expect(mod(10, -5)).toBe(0);
		expect(mod(-3, -5)).toBe(-3);
	});

	test("Both a negative dividend and divisor", () => {
		expect(mod(-3, -5)).toBe(-3);
	});

	test("Decimal numbers", () => {
		expect(mod(5.5, 2)).toBe(1.5);
		expect(mod(7.25, 2.5)).toBe(2.25);
		expect(mod(10.5, 3.5)).toBe(0);
		expect(mod(2.75, 5.5)).toBe(2.75);
		expect(mod(-5.5, 2)).toBe(0.5);
	});

	test("The divisor is larger than the dividend", () => {
		expect(mod(2, 10)).toBe(2);
	});
});
