import { describe, expect, test } from "bun:test";
import { isEmpty } from "./isEmpty";

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
			expect(isEmpty({ foo: "bar" })).toBeFalse();
		});

		test("Object (undefined value key)", () => {
			expect(isEmpty({ foo: undefined })).toBeFalse();
		});

		test("Array", () => {
			expect(isEmpty(["foo"])).toBeFalse();
		});

		test("Number", () => {
			expect(isEmpty(0)).toBeFalse();
			expect(isEmpty(1)).toBeFalse();
		});
	});
});
