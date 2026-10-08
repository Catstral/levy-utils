import { describe, expect, test } from "bun:test";
import { isUndefined } from ".";

describe("isUndefined", () => {
	describe("Undefined values", () => {
		test("Undefined", () => {
			expect(isUndefined(undefined)).toBeTrue();
		});
	});

	describe("Non-undefined values", () => {
		test("String", () => {
			expect(isUndefined("")).toBeFalse();
			expect(isUndefined("foo")).toBeFalse();
		});

		test("Null", () => {
			expect(isUndefined(null)).toBeFalse();
		});

		test("Object", () => {
			expect(isUndefined({})).toBeFalse();
			expect(
				isUndefined({
					foo: "bar",
				}),
			).toBeFalse();
		});

		test("Array", () => {
			expect(isUndefined([])).toBeFalse();
			expect(isUndefined(["foo"])).toBeFalse();
		});

		test("Number", () => {
			expect(isUndefined(0)).toBeFalse();
			expect(isUndefined(1)).toBeFalse();
		});

		test("NaN", () => {
			expect(isUndefined(Number.NaN)).toBeFalse();
		});

		test("Infinity", () => {
			expect(isUndefined(Number.POSITIVE_INFINITY)).toBeFalse();
			expect(isUndefined(Number.NEGATIVE_INFINITY)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isUndefined(false)).toBeFalse();
			expect(isUndefined(true)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isUndefined(Symbol("foo"))).toBeFalse();
		});

		test("Function", () => {
			expect(isUndefined(() => {})).toBeFalse();
		});

		test("BigInt", () => {
			expect(isUndefined(BigInt(0))).toBeFalse();
		});

		test("Class instance with properties", () => {
			class Foo {
				bar = "baz";
			}

			expect(isUndefined(new Foo())).toBeFalse();
		});

		test("Object with a `__proto__` own key", () => {
			const obj = JSON.parse('{"__proto__":{}}');

			expect(isUndefined(obj)).toBeFalse();
		});
	});
});
