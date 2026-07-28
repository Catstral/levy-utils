import { describe, expect, test } from "bun:test";
import { isObject } from "./isObject";

describe("isObject", () => {
	describe("Objects", () => {
		test("Empty", () => {
			expect(isObject({})).toBeTrue();
		});

		test("With keys", () => {
			expect(isObject({ foo: "bar" })).toBeTrue();
		});

		test("Class", () => {
			expect(isObject(new (class Foo {})())).toBeTrue();
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

		test("null", () => {
			expect(isObject(null)).toBeFalse();
		});

		test("undefined", () => {
			expect(isObject(undefined)).toBeFalse();
		});
	});
});
