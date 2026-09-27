import { describe, expect, test } from "bun:test";
import { trunc } from ".";

describe("trunc", () => {
	test("Integer", () => {
		expect(trunc(123)).toBe(123);
	});

	test("Decimal number", () => {
		expect(trunc(123.456)).toBe(123);
	});

	test("Positive fraction digits", () => {
		expect(trunc(123.456, 2)).toBe(123.45);
	});

	test("Zero fraction digits", () => {
		expect(trunc(123.456, 0)).toBe(123);
	});

	test("Negative number", () => {
		expect(trunc(-123.456)).toBe(-123);
	});

	test("Negative number with fraction digits", () => {
		expect(trunc(-123.456, 2)).toBe(-123.45);
	});

	test("More fraction digits than available", () => {
		expect(trunc(123.45, 5)).toBe(123.45);
	});

	test("Maximum fraction digits", () => {
		expect(trunc(123.456, 100)).toBe(123.456);
	});

	test("Throws for negative fraction digits", () => {
		expect(() => trunc(123.456, -1)).toThrow(RangeError);
	});

	test("Throws for more than 100 fraction digits", () => {
		expect(() => trunc(123.456, 101)).toThrow(RangeError);
	});
});
