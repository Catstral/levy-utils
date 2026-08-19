import { describe, expect, test } from "bun:test";
import { isEmpty } from ".";

describe("isEmpty", () => {
	describe("Empty values", () => {
		test("String", () => {
			expect(isEmpty("")).toBeTrue();
		});

		test("Object", () => {
			expect(isEmpty({})).toBeTrue();
		});

		test("Array", () => {
			expect(isEmpty([])).toBeTrue();
		});

		test("Null", () => {
			expect(isEmpty(null)).toBeTrue();
		});

		test("Undefined", () => {
			expect(isEmpty(undefined)).toBeTrue();
		});
	});

	describe("Non-empty values", () => {
		test("String", () => {
			expect(isEmpty("foo")).toBeFalse();
		});

		test("Object", () => {
			expect(
				isEmpty({
					foo: "bar",
				}),
			).toBeFalse();
		});

		test("Object (undefined value key)", () => {
			expect(
				isEmpty({
					foo: undefined,
				}),
			).toBeFalse();
		});

		test("Array", () => {
			expect(isEmpty(["foo"])).toBeFalse();
		});

		test("Number", () => {
			expect(isEmpty(0)).toBeFalse();
			expect(isEmpty(1)).toBeFalse();
		});

		test("NaN", () => {
			expect(isEmpty(Number.NaN)).toBeFalse();
		});

		test("Infinity", () => {
			expect(isEmpty(Number.POSITIVE_INFINITY)).toBeFalse();
			expect(isEmpty(Number.NEGATIVE_INFINITY)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isEmpty(false)).toBeFalse();
			expect(isEmpty(true)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isEmpty(Symbol("foo"))).toBeFalse();
		});

		test("Function", () => {
			expect(isEmpty(() => {})).toBeFalse();
		});

		test("BigInt", () => {
			expect(isEmpty(BigInt(0))).toBeFalse();
		});

		test("Class instance with properties", () => {
			class Foo {
				bar = "baz";
			}

			expect(isEmpty(new Foo())).toBeFalse();
		});

		test("Object with a `__proto__` own key", () => {
			const obj = JSON.parse('{"__proto__":{}}');

			expect(isEmpty(obj)).toBeFalse();
		});
	});

	describe("Values considered empty due to having no own enumerable keys", () => {
		// NOTE: `isEmpty` decides objects are empty based on `Object.keys(...).length`.
		// Built-ins like `Map`/`Set`/`Date`/`RegExp` store their internal state outside of
		// own enumerable properties, so they are always reported as "empty" here, even
		// when they clearly hold data. This would be something to look into in the future.
		test("Date", () => {
			expect(isEmpty(new Date())).toBeTrue();
		});

		test("RegExp", () => {
			expect(isEmpty(/foo/)).toBeTrue();
		});

		test("Empty Map", () => {
			expect(isEmpty(new Map())).toBeTrue();
		});

		test("Non-empty Map", () => {
			expect(isEmpty(new Map([["a", 1]]))).toBeTrue();
		});

		test("Non-empty Set", () => {
			expect(isEmpty(new Set([1, 2, 3]))).toBeTrue();
		});

		test("Class instance without properties", () => {
			class Foo {}

			expect(isEmpty(new Foo())).toBeTrue();
		});

		test("Object with null prototype", () => {
			expect(isEmpty(Object.create(null))).toBeTrue();
		});
	});
});
