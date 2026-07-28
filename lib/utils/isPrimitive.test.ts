import { describe, expect, test } from "bun:test";
import { isPrimitive } from "./isPrimitive";

describe("isPrimitive", () => {
	describe("Primitives", () => {
		test("String", () => {
			expect(isPrimitive("foo")).toBeTrue();
		});

		test("Number", () => {
			expect(isPrimitive(0)).toBeTrue();
		});

		test("Boolean", () => {
			expect(isPrimitive(false)).toBeTrue();
			expect(isPrimitive(true)).toBeTrue();
		});

		test("Symbol", () => {
			expect(isPrimitive(Symbol("foo"))).toBeTrue();
		});

		test("Null", () => {
			expect(isPrimitive(null)).toBeTrue();
		});

		test("Undefined", () => {
			expect(isPrimitive(undefined)).toBeTrue();
		});
	});

	describe("Non primitives", () => {
		test("Big int", () => {
			expect(isPrimitive(0n)).toBeFalse();
		});

		test("Object", () => {
			expect(isPrimitive({})).toBeFalse();
		});

		test("Array", () => {
			expect(isPrimitive([])).toBeFalse();
		});

		test("Class", () => {
			expect(isPrimitive(new (class Foo {})())).toBeFalse();
		});
	});
});
