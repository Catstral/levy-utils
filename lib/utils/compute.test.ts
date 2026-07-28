import { describe, expect, test } from "bun:test";
import { compute, isComputation } from "./compute";

describe("compute", () => {
	describe("Non-computable", () => {
		test("String", () => {
			expect(compute("foo")).toBe("foo");
		});

		test("Number", () => {
			expect(compute(5)).toBe(5);
		});

		test("Boolean", () => {
			expect(compute(false)).toBeFalse();
			expect(compute(true)).toBeTrue();
		});

		test("Array", () => {
			expect(compute([])).toBeArrayOfSize(0);
		});

		test("Object", () => {
			expect(compute({})).toBeEmptyObject();
		});
	});

	describe("Computable", () => {
		test("String", () => {
			expect(compute(() => "foo")).toBe("foo");
		});

		test("Number", () => {
			expect(compute(() => 5)).toBe(5);
		});

		test("Boolean", () => {
			expect(compute(() => true)).toBeTrue();
			expect(compute(() => false)).toBeFalse();
		});

		test("Array", () => {
			expect(compute(() => [])).toBeArrayOfSize(0);
		});

		test("Object", () => {
			expect(compute(() => ({}))).toBeEmptyObject();
		});
	});
});

describe("isComputation", () => {
	describe("Non-computable", () => {
		test("String", () => {
			expect(isComputation("")).toBeFalse();
		});

		test("Number", () => {
			expect(isComputation(5)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isComputation(true)).toBeFalse();
			expect(isComputation(false)).toBeFalse();
		});

		test("Array", () => {
			expect(isComputation([])).toBeFalse();
		});

		test("Object", () => {
			expect(isComputation({})).toBeFalse();
		});
	});

	describe("Computable", () => {
		test("String", () => {
			expect(isComputation(() => "")).toBeTrue();
		});

		test("Number", () => {
			expect(isComputation(() => 5)).toBeTrue();
		});

		test("Boolean", () => {
			expect(isComputation(() => true)).toBeTrue();
			expect(isComputation(() => false)).toBeTrue();
		});

		test("Array", () => {
			expect(isComputation(() => [])).toBeTrue();
		});

		test("Object", () => {
			expect(isComputation(() => ({}))).toBeTrue();
		});
	});
});
