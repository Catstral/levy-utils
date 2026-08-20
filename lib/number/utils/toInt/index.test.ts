import { describe, expect, test } from "bun:test";
import { type Integer, toInt } from ".";

describe.concurrent("toInt", () => {
	describe.concurrent("Booleans", () => {
		test.concurrent("True", () => {
			expect(toInt(true)).toBe(1);
		});

		test.concurrent("False", () => {
			expect(toInt(false)).toBe(0);
		});
	});

	describe.concurrent("Numbers", () => {
		test.concurrent("Positive integer", () => {
			expect(toInt(42)).toBe(42);
		});

		test.concurrent("Negative integer", () => {
			expect(toInt(-42)).toBe(-42);
		});

		test.concurrent("Positive decimal is truncated", () => {
			expect(toInt(5.9)).toBe(5);
		});

		test.concurrent("Negative decimal is truncated", () => {
			expect(toInt(-5.9)).toBe(-5);
		});

		test.concurrent("NaN falls back", () => {
			expect(toInt(Number.NaN)).toBe(0);
		});

		test.concurrent("Infinity falls back", () => {
			expect(toInt(Number.POSITIVE_INFINITY)).toBe(0);
			expect(toInt(Number.NEGATIVE_INFINITY)).toBe(0);
		});
	});

	describe.concurrent("Bigints", () => {
		test.concurrent("Positive bigint", () => {
			expect(toInt(10n)).toBe(10);
		});

		test.concurrent("Negative bigint", () => {
			expect(toInt(-10n)).toBe(-10);
		});
	});

	describe.concurrent("Strings", () => {
		test.concurrent("Integer string", () => {
			expect(toInt("42")).toBe(42);
		});

		test.concurrent("Negative integer string", () => {
			expect(toInt("-42")).toBe(-42);
		});

		test.concurrent("Decimal string is truncated", () => {
			expect(toInt("42.9")).toBe(42);
		});

		test.concurrent("Surrounding whitespace is ignored", () => {
			expect(toInt("  42  ")).toBe(42);
		});

		test.concurrent("Non-numeric string falls back", () => {
			expect(toInt("abc")).toBe(0);
		});

		test.concurrent("Empty string falls back", () => {
			expect(toInt("")).toBe(0);
		});

		test.concurrent("Hex-like string is parsed with radix 10", () => {
			expect(toInt("0x1A")).toBe(0);
		});
	});

	describe.concurrent("Invalid values", () => {
		test.concurrent("Null falls back", () => {
			expect(toInt(null)).toBe(0);
		});

		test.concurrent("Undefined falls back", () => {
			expect(toInt(undefined)).toBe(0);
		});

		test.concurrent("Object falls back", () => {
			expect(toInt({})).toBe(0);
		});

		test.concurrent("Array falls back", () => {
			expect(toInt([])).toBe(0);
		});

		test.concurrent("Symbol falls back", () => {
			expect(toInt(Symbol("foo"))).toBe(0);
		});
	});

	describe.concurrent("Fallback", () => {
		test.concurrent("Custom fallback is used for invalid values", () => {
			expect(toInt(undefined, 5)).toBe(5);
		});

		test.concurrent("Custom fallback is truncated", () => {
			expect(toInt(undefined, 5.7 as unknown as Integer<number>)).toBe(5);
			expect(toInt(null, -3.7 as unknown as Integer<number>)).toBe(-3);
		});

		test.concurrent("Fallback is not used for valid values", () => {
			expect(toInt("42", 5)).toBe(42);
		});
	});
});
