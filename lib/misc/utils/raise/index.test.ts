import { beforeEach, describe, expect, test } from "bun:test";
import { raise } from ".";

function caught(value: unknown): unknown {
	try {
		raise(value) as unknown;
	} catch (error) {
		return error;
	}

	throw new Error("Raise did not throw");
}

describe("raise", () => {
	beforeEach(() => {
		raise.config.reset();
	});

	describe("String", () => {
		test("Throws an Error with the string as message", () => {
			expect(() => raise("foo")).toThrow(new Error("foo"));
		});

		test("Empty string", () => {
			const error = caught("");

			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe("");
		});
	});

	describe("Function", () => {
		test("Throws a returned string as is, without wrapping it in an Error", () => {
			const error = caught(() => "foo");

			expect(error).not.toBeInstanceOf(Error);
			expect(error).toBe("foo");
		});

		test("Throws a returned Error as is", () => {
			const original = new TypeError("foo");

			expect(caught(() => original)).toBe(original);
		});

		test("Throws a returned object as is", () => {
			const original = { code: 404 };

			expect(caught(() => original)).toBe(original);
		});

		test("Throws a returned number as is", () => {
			expect(caught(() => 5)).toBe(5);
		});

		test("Throws undefined if the function returns nothing", () => {
			expect(caught(() => {})).toBeUndefined();
		});

		test("Calls the function exactly once, without arguments", () => {
			let calls = 0;
			let received: unknown[] = [];

			caught((...args: unknown[]) => {
				calls++;
				received = args;

				return "foo";
			});

			expect(calls).toBe(1);
			expect(received).toBeEmpty();
		});

		test("Propagates errors thrown by the function", () => {
			const original = new RangeError("boom");

			expect(
				caught(() => {
					throw original;
				}),
			).toBe(original);
		});

		test("Does not unwrap a returned function", () => {
			const inner = () => "foo";

			expect(caught(() => inner)).toBe(inner);
		});
	});

	describe("Other values", () => {
		test("Throws an Error as is", () => {
			const original = new Error("foo");

			expect(caught(original)).toBe(original);
		});

		test("Throws a custom Error subclass as is", () => {
			class CustomError extends Error {}
			const original = new CustomError("foo");

			expect(caught(original)).toBe(original);
		});

		test("Object", () => {
			const original = { foo: "bar" };

			expect(caught(original)).toBe(original);
		});

		test("Array", () => {
			const original: unknown[] = [];

			expect(caught(original)).toBe(original);
		});

		test("Number", () => {
			expect(caught(5)).toBe(5);
		});

		test("Boolean", () => {
			expect(caught(true)).toBeTrue();
			expect(caught(false)).toBeFalse();
		});

		test("BigInt", () => {
			expect(caught(5n)).toBe(5n);
		});

		test("Symbol", () => {
			const original = Symbol("foo");

			expect(caught(original)).toBe(original);
		});

		test("Null", () => {
			expect(caught(null)).toBeNull();
		});

		test("Undefined", () => {
			expect(caught(undefined)).toBeUndefined();
		});

		test("Promise is thrown as is, not awaited", () => {
			const original = Promise.resolve(5);

			expect(caught(original)).toBe(original);
		});
	});
});
