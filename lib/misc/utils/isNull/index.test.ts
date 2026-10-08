import { describe, expect, test } from "bun:test";
import { isNull } from ".";

describe("isNull", () => {
	describe("Null values", () => {
		test("Null", () => {
			expect(isNull(null)).toBeTrue();
		});
	});

	describe("Non-null values", () => {
		test("String", () => {
			expect(isNull("")).toBeFalse();
			expect(isNull("foo")).toBeFalse();
		});

		test("Undefined", () => {
			expect(isNull(undefined)).toBeFalse();
		});

		test("Object", () => {
			expect(isNull({})).toBeFalse();
			expect(
				isNull({
					foo: "bar",
				}),
			).toBeFalse();
		});

		test("Array", () => {
			expect(isNull([])).toBeFalse();
			expect(isNull(["foo"])).toBeFalse();
		});

		test("Number", () => {
			expect(isNull(0)).toBeFalse();
			expect(isNull(1)).toBeFalse();
		});

		test("NaN", () => {
			expect(isNull(Number.NaN)).toBeFalse();
		});

		test("Infinity", () => {
			expect(isNull(Number.POSITIVE_INFINITY)).toBeFalse();
			expect(isNull(Number.NEGATIVE_INFINITY)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isNull(false)).toBeFalse();
			expect(isNull(true)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isNull(Symbol("foo"))).toBeFalse();
		});

		test("Function", () => {
			expect(isNull(() => {})).toBeFalse();
		});

		test("BigInt", () => {
			expect(isNull(BigInt(0))).toBeFalse();
		});

		test("Class instance with properties", () => {
			class Foo {
				bar = "baz";
			}

			expect(isNull(new Foo())).toBeFalse();
		});

		test("Object with a `__proto__` own key", () => {
			const obj = JSON.parse('{"__proto__":{}}');

			expect(isNull(obj)).toBeFalse();
		});
	});
});
