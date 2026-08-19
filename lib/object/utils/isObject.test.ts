import { describe, expect, test } from "bun:test";
import { isObject } from "./isObject";

describe("isObject", () => {
	describe("Objects", () => {
		test("Empty", () => {
			expect(isObject({})).toBeTrue();
		});

		test("With keys", () => {
			expect(
				isObject({
					foo: "bar",
				}),
			).toBeTrue();
		});

		test("Class", () => {
			expect(isObject(new (class Foo {})())).toBeTrue();
		});

		test("Date", () => {
			expect(isObject(new Date())).toBeTrue();
		});

		test("RegExp", () => {
			expect(isObject(/foo/)).toBeTrue();
		});

		test("Map", () => {
			expect(isObject(new Map())).toBeTrue();
		});

		test("Set", () => {
			expect(isObject(new Set())).toBeTrue();
		});

		test("Error", () => {
			expect(isObject(new Error("foo"))).toBeTrue();
		});

		test("Object with null prototype", () => {
			expect(isObject(Object.create(null))).toBeTrue();
		});

		test("Boxed primitives", () => {
			expect(isObject(new String("foo"))).toBeTrue();
			expect(isObject(new Number(0))).toBeTrue();
			expect(isObject(new Boolean(false))).toBeTrue();
		});
	});

	describe("Non-objects", () => {
		test("String", () => {
			expect(isObject("foo")).toBeFalse();
			expect(isObject('{ "foo": "bar" }')).toBeFalse();
		});

		test("Number", () => {
			expect(isObject(0)).toBeFalse();
		});

		test("Array", () => {
			expect(isObject([])).toBeFalse();
		});

		test("Symbol", () => {
			expect(isObject(Symbol("foo"))).toBeFalse();
		});

		test("Null", () => {
			expect(isObject(null)).toBeFalse();
		});

		test("Undefined", () => {
			expect(isObject(undefined)).toBeFalse();
		});

		test("Function", () => {
			expect(isObject(() => {})).toBeFalse();
			expect(isObject(function foo() {})).toBeFalse();
		});

		test("NaN", () => {
			expect(isObject(Number.NaN)).toBeFalse();
		});

		test("BigInt", () => {
			expect(isObject(BigInt(0))).toBeFalse();
		});

		test("Boolean", () => {
			expect(isObject(true)).toBeFalse();
			expect(isObject(false)).toBeFalse();
		});
	});
});
