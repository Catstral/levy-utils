import { describe, expect, test } from "bun:test";
import { toFloat } from ".";

describe("toFloat", () => {
	describe("Numbers", () => {
		test("Integer", () => {
			expect(toFloat(5)).toBe(5);
		});

		test("Float", () => {
			expect(toFloat(5.5)).toBe(5.5);
		});

		test("Negative float", () => {
			expect(toFloat(-42.5)).toBe(-42.5);
		});

		test("NaN falls back", () => {
			expect(toFloat(Number.NaN)).toBe(0);
		});

		test("Infinity falls back", () => {
			expect(toFloat(Number.POSITIVE_INFINITY)).toBe(0);
			expect(toFloat(Number.NEGATIVE_INFINITY)).toBe(0);
		});
	});

	describe("Bigints", () => {
		test("Positive bigint", () => {
			expect(toFloat(10n)).toBe(10);
		});

		test("Negative bigint", () => {
			expect(toFloat(-10n)).toBe(-10);
		});
	});

	describe("Booleans", () => {
		test("True", () => {
			expect(toFloat(true)).toBe(1);
		});

		test("False", () => {
			expect(toFloat(false)).toBe(0);
		});
	});

	describe("Strings", () => {
		test("Simple float string", () => {
			expect(toFloat("3.14")).toBe(3.14);
		});

		test("Negative float string", () => {
			expect(toFloat("-42.5")).toBe(-42.5);
		});

		test("Leading/trailing whitespace is trimmed", () => {
			expect(toFloat("  3.14  ")).toBe(3.14);
		});

		test("Scientific notation", () => {
			expect(toFloat("1e3")).toBe(1000);
		});

		test("Partial numeric string parses the leading numeric portion", () => {
			expect(toFloat("3.14abc")).toBe(3.14);
		});

		test("Locale-formatted number stops at the thousands separator", () => {
			expect(toFloat("1,234.56")).toBe(1);
		});

		test("Non-numeric string falls back", () => {
			expect(toFloat("abc")).toBe(0);
		});

		test("Empty string falls back", () => {
			expect(toFloat("")).toBe(0);
		});
	});

	describe("Unsupported types fall back", () => {
		test("Null", () => {
			expect(toFloat(null)).toBe(0);
		});

		test("Undefined", () => {
			expect(toFloat(undefined)).toBe(0);
		});

		test("Object", () => {
			expect(toFloat({})).toBe(0);
		});

		test("Array", () => {
			expect(toFloat([])).toBe(0);
		});

		test("Symbol", () => {
			expect(toFloat(Symbol("test"))).toBe(0);
		});
	});

	describe("Custom fallback", () => {
		test("Used for invalid strings", () => {
			expect(toFloat("abc", 99)).toBe(99);
		});

		test("Used for NaN input", () => {
			expect(toFloat(Number.NaN, -1)).toBe(-1);
		});

		test("Not used when the value is valid", () => {
			expect(toFloat("3.14", 99)).toBe(3.14);
		});
	});
});
