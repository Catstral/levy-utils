import { beforeEach, describe, expect, expectTypeOf, test } from "bun:test";
import { identity } from ".";

describe("identity", () => {
	beforeEach(() => {
		identity.config.reset();
	});

	describe("Primitives", () => {
		test("String", () => {
			expect(identity("foo")).toBe("foo");
			expect(identity("")).toBe("");
		});

		test("Number", () => {
			expect(identity(5)).toBe(5);
			expect(identity(0)).toBe(0);
			expect(identity(-1.5)).toBe(-1.5);
			expect(identity(Number.NaN)).toBeNaN();
			expect(identity(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
		});

		test("Negative zero stays negative zero", () => {
			expect(Object.is(identity(-0), -0)).toBeTrue();
		});

		test("Boolean", () => {
			expect(identity(true)).toBeTrue();
			expect(identity(false)).toBeFalse();
		});

		test("BigInt", () => {
			expect(identity(5n)).toBe(5n);
		});

		test("Symbol", () => {
			const value = Symbol("foo");

			expect(identity(value)).toBe(value);
		});

		test("Null", () => {
			expect(identity(null)).toBeNull();
		});

		test("Undefined", () => {
			expect(identity(undefined)).toBeUndefined();
		});
	});

	describe("References", () => {
		test("Object is returned by reference", () => {
			const value = { foo: "bar" };

			expect(identity(value)).toBe(value);
		});

		test("Array is returned by reference", () => {
			const value = [1, 2, 3];

			expect(identity(value)).toBe(value);
		});

		test("Function is returned by reference, without being called", () => {
			let calls = 0;
			const value = () => {
				calls++;
			};

			expect(identity(value)).toBe(value);
			expect(calls).toBe(0);
		});

		test("Class instance", () => {
			class Foo {}
			const value = new Foo();

			expect(identity(value)).toBe(value);
		});

		test("Error is not thrown", () => {
			const value = new Error("foo");

			expect(identity(value)).toBe(value);
		});

		test("Promise is not awaited", () => {
			const value = Promise.resolve(5);

			expect(identity(value)).toBe(value);
		});

		test("Does not copy or mutate the value", () => {
			const value = Object.freeze({ foo: ["bar"] });
			const result = identity(value);

			expect(result).toBe(value);
			expect(result.foo).toBe(value.foo);
			expect(value).toEqual({ foo: ["bar"] });
		});

		test("Distinct but equal values are not conflated", () => {
			const a = {
				foo: "bar",
			};
			const b = {
				foo: "bar",
			};

			expect(identity(a)).not.toBe(b);
		});
	});

	describe("Usage", () => {
		test("Can be used as a callback", () => {
			expect([1, 2, 3].map(identity)).toEqual([1, 2, 3]);
		});

		test("Can be used to filter by truthiness", () => {
			expect([0, 1, "", "foo", null, undefined, false, true].filter(identity)).toEqual([1, "foo", true]);
		});

		test("Ignores extra arguments", () => {
			const loose = identity as (...args: unknown[]) => unknown;

			expect(loose("foo", "bar")).toBe("foo");
		});

		test("Called without arguments at runtime returns undefined", () => {
			const loose = identity as unknown as () => unknown;

			expect(loose()).toBeUndefined();
		});
	});

	describe("Types", () => {
		test("Literals are preserved", () => {
			expectTypeOf(identity("foo")).toEqualTypeOf<"foo">();
			expectTypeOf(identity(5)).toEqualTypeOf<5>();
			expectTypeOf(identity(true)).toEqualTypeOf<true>();
		});

		test("Arrays are inferred as readonly tuples", () => {
			expectTypeOf(identity([1, 2])).toEqualTypeOf<readonly [1, 2]>();
		});

		test("Object properties are inferred as readonly literals", () => {
			expectTypeOf(
				identity({
					foo: "bar",
				}),
			).toEqualTypeOf<{
				readonly foo: "bar";
			}>();
		});

		test("Widened types are kept for non literals", () => {
			const value: string = "foo";

			expectTypeOf(identity(value)).toEqualTypeOf<string>();
		});

		test("Null and undefined", () => {
			expectTypeOf(identity(null)).toBeNull();
			expectTypeOf(identity(undefined)).toBeUndefined();
		});
	});
});
