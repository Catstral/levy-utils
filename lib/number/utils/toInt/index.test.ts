import { beforeEach, describe, expect, test } from "bun:test";
import type { Integer } from "../../types";
import { toInt } from ".";

// TODO: add tests for config

describe("toInt", () => {
	beforeEach(() => {
		toInt.config.reset();
	});

	describe("Booleans", () => {
		test("True", () => {
			expect(toInt(true)).toBe(1);
		});

		test("False", () => {
			expect(toInt(false)).toBe(0);
		});
	});

	describe("Numbers", () => {
		test("Positive integer", () => {
			expect(toInt(42)).toBe(42);
		});

		test("Negative integer", () => {
			expect(toInt(-42)).toBe(-42);
		});

		test("Positive decimal is truncated", () => {
			expect(toInt(5.9)).toBe(5);
		});

		test("Negative decimal is truncated", () => {
			expect(toInt(-5.9)).toBe(-5);
		});

		test("NaN falls back", () => {
			expect(toInt(Number.NaN)).toBe(0);
		});

		test("Infinity falls back", () => {
			expect(toInt(Number.POSITIVE_INFINITY)).toBe(0);
			expect(toInt(Number.NEGATIVE_INFINITY)).toBe(0);
		});
	});

	describe("Bigints", () => {
		test("Positive bigint", () => {
			expect(toInt(10n)).toBe(10);
		});

		test("Negative bigint", () => {
			expect(toInt(-10n)).toBe(-10);
		});
	});

	describe("Strings", () => {
		test("Integer string", () => {
			expect(toInt("42")).toBe(42);
		});

		test("Negative integer string", () => {
			expect(toInt("-42")).toBe(-42);
		});

		test("Decimal string is truncated", () => {
			expect(toInt("42.9")).toBe(42);
		});

		test("Surrounding whitespace is ignored", () => {
			expect(toInt("  42  ")).toBe(42);
		});

		test("Non-numeric string falls back", () => {
			expect(toInt("abc")).toBe(0);
		});

		test("Empty string falls back", () => {
			expect(toInt("")).toBe(0);
		});

		test("Hex-like string is parsed with radix 10", () => {
			expect(toInt("0x1A")).toBe(0);
		});
	});

	describe("Invalid values", () => {
		test("Null falls back", () => {
			expect(toInt(null)).toBe(0);
		});

		test("Undefined falls back", () => {
			expect(toInt(undefined)).toBe(0);
		});

		test("Object falls back", () => {
			expect(toInt({})).toBe(0);
		});

		test("Array falls back", () => {
			expect(toInt([])).toBe(0);
		});

		test("Symbol falls back", () => {
			expect(toInt(Symbol("foo"))).toBe(0);
		});
	});

	describe("Fallback", () => {
		test("Custom fallback is used for invalid values", () => {
			expect(toInt(undefined, 5)).toBe(5);
		});

		test("Custom fallback is truncated", () => {
			expect(toInt(undefined, 5.7 as unknown as Integer<number>)).toBe(5);
			expect(toInt(null, -3.7 as unknown as Integer<number>)).toBe(-3);
		});

		test("Fallback is not used for valid values", () => {
			expect(toInt("42", 5)).toBe(42);
		});
	});
});
