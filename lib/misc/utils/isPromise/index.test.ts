// biome-ignore-all lint/suspicious/noThenProperty: Expected behavior
import { describe, expect, expectTypeOf, test } from "bun:test";
import { isPromise } from ".";

describe("isPromise", () => {
	describe("Promises", () => {
		test("Resolved promise", () => {
			expect(isPromise(Promise.resolve(5))).toBeTrue();
		});

		test("Rejected promise", () => {
			const value = Promise.reject(new Error("foo"));
			value.catch(() => {});

			expect(isPromise(value)).toBeTrue();
		});

		test("Pending promise", () => {
			expect(isPromise(new Promise(() => {}))).toBeTrue();
		});

		test("Async function result", () => {
			const fn = async () => 5;

			expect(isPromise(fn())).toBeTrue();
		});

		test("Chained promise", () => {
			expect(isPromise(Promise.resolve(5).then((value) => value + 1))).toBeTrue();
		});

		test("Promise subclass instance", () => {
			class FooPromise<T> extends Promise<T> {}

			expect(isPromise(new FooPromise(() => {}))).toBeTrue();
		});

		test("Object with `Promise.prototype` as its prototype", () => {
			expect(isPromise(Object.create(Promise.prototype))).toBeTrue();
		});
	});

	describe("Non-promises", () => {
		test("Null", () => {
			expect(isPromise(null)).toBeFalse();
		});

		test("Undefined", () => {
			expect(isPromise(undefined)).toBeFalse();
		});

		test("String", () => {
			expect(isPromise("")).toBeFalse();
			expect(isPromise("foo")).toBeFalse();
		});

		test("Number", () => {
			expect(isPromise(0)).toBeFalse();
			expect(isPromise(1)).toBeFalse();
			expect(isPromise(Number.NaN)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isPromise(true)).toBeFalse();
			expect(isPromise(false)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isPromise(Symbol("foo"))).toBeFalse();
		});

		test("BigInt", () => {
			expect(isPromise(BigInt(0))).toBeFalse();
		});

		test("Object", () => {
			expect(isPromise({})).toBeFalse();
			expect(isPromise({ foo: "bar" })).toBeFalse();
		});

		test("Array", () => {
			expect(isPromise([])).toBeFalse();
			expect(isPromise([Promise.resolve(5)])).toBeFalse();
		});

		test("Function", () => {
			expect(isPromise(() => {})).toBeFalse();
			expect(isPromise(async () => {})).toBeFalse();
		});

		test("Promise constructor", () => {
			expect(isPromise(Promise)).toBeFalse();
		});

		test("Class instance", () => {
			class Foo {}

			expect(isPromise(new Foo())).toBeFalse();
		});

		test("Error", () => {
			expect(isPromise(new Error("foo"))).toBeFalse();
		});
	});

	describe("Thenables", () => {
		test("Object with a `then` method is not a promise", () => {
			expect(
				isPromise({
					then: () => {},
				}),
			).toBeFalse();
		});

		test("Object that looks like a promise is not a promise", () => {
			expect(
				isPromise({
					then: () => {},
					catch: () => {},
					finally: () => {},
				}),
			).toBeFalse();
		});

		test("Object with `Symbol.toStringTag` of `Promise` is not a promise", () => {
			expect(isPromise({ [Symbol.toStringTag]: "Promise" })).toBeFalse();
		});
	});

	describe("Types", () => {
		test("Narrows `unknown` to `Promise<unknown>`", () => {
			const value: unknown = Promise.resolve(5);

			if (isPromise(value)) {
				expectTypeOf(value).toEqualTypeOf<Promise<unknown>>();
			}
		});
	});
});
