import { describe, expect, test } from "bun:test";
import { isNullish } from ".";

describe("isNullish", () => {
	describe("Nullish values", () => {
		test("Null", () => {
			expect(isNullish(null)).toBeTrue();
		});

		test("Undefined", () => {
			expect(isNullish(undefined)).toBeTrue();
		});
	});

	describe("Non-nullish values", () => {
		test("String", () => {
			expect(isNullish("")).toBeFalse();
			expect(isNullish("foo")).toBeFalse();
		});

		test("Object", () => {
			expect(isNullish({})).toBeFalse();
			expect(
				isNullish({
					foo: "bar",
				}),
			).toBeFalse();
		});

		test("Array", () => {
			expect(isNullish([])).toBeFalse();
			expect(isNullish(["foo"])).toBeFalse();
		});

		test("Number", () => {
			expect(isNullish(0)).toBeFalse();
			expect(isNullish(1)).toBeFalse();
		});

		test("NaN", () => {
			expect(isNullish(Number.NaN)).toBeFalse();
		});

		test("Infinity", () => {
			expect(isNullish(Number.POSITIVE_INFINITY)).toBeFalse();
			expect(isNullish(Number.NEGATIVE_INFINITY)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isNullish(false)).toBeFalse();
			expect(isNullish(true)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isNullish(Symbol("foo"))).toBeFalse();
		});

		test("Function", () => {
			expect(isNullish(() => {})).toBeFalse();
		});

		test("BigInt", () => {
			expect(isNullish(BigInt(0))).toBeFalse();
		});

		test("Class instance with properties", () => {
			class Foo {
				bar = "baz";
			}

			expect(isNullish(new Foo())).toBeFalse();
		});

		test("Object with a `__proto__` own key", () => {
			const obj = JSON.parse('{"__proto__":{}}');

			expect(isNullish(obj)).toBeFalse();
		});
	});
});
