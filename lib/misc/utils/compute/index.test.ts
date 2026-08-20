import { describe, expect, test } from "bun:test";
import { compute, isComputation } from ".";

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

		test("Null", () => {
			expect(compute(null)).toBeNull();
		});

		test("Undefined", () => {
			expect(compute(undefined)).toBeUndefined();
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

		test("Undefined return value", () => {
			expect(compute(() => undefined)).toBeUndefined();
		});

		test("Passes arguments through to the callback", () => {
			const result = compute((a: number, b: number) => a + b, 1, 2);
			expect(result).toBe(3);
		});

		test("Promise-returning callback is not awaited by compute", async () => {
			const result = compute(() => Promise.resolve(5));
			expect(result).toBeInstanceOf(Promise);
			await expect(result).resolves.toBe(5);
		});

		test("Async function", async () => {
			const result = compute(async () => "foo");
			expect(result).toBeInstanceOf(Promise);
			await expect(result).resolves.toBe("foo");
		});

		test("Propagates errors thrown by the callback", () => {
			expect(() =>
				compute(() => {
					throw new Error("boom");
				}),
			).toThrow("boom");
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

		test("Null", () => {
			expect(isComputation(null)).toBeFalse();
		});

		test("Undefined", () => {
			expect(isComputation(undefined)).toBeFalse();
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

		test("Async function", () => {
			expect(isComputation(async () => "foo")).toBeTrue();
		});
	});
});
