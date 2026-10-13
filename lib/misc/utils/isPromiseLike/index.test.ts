// biome-ignore-all lint/suspicious/noThenProperty: Expected behavior
import { describe, expect, expectTypeOf, test } from "bun:test";
import { isPromiseLike } from ".";

describe("isPromiseLike", () => {
	describe("Promises", () => {
		test("Resolved promise", () => {
			expect(isPromiseLike(Promise.resolve(5))).toBeTrue();
		});

		test("Rejected promise", () => {
			const value = Promise.reject(new Error("foo"));
			value.catch(() => {});

			expect(isPromiseLike(value)).toBeTrue();
		});

		test("Pending promise", () => {
			expect(isPromiseLike(new Promise(() => {}))).toBeTrue();
		});

		test("Async function result", () => {
			const fn = async () => 5;

			expect(isPromiseLike(fn())).toBeTrue();
		});

		test("Promise subclass instance", () => {
			class FooPromise<T> extends Promise<T> {}

			expect(isPromiseLike(new FooPromise(() => {}))).toBeTrue();
		});
	});

	describe("Thenables", () => {
		test("Object with a `then` method", () => {
			expect(
				isPromiseLike({
					then: () => {},
				}),
			).toBeTrue();
		});

		test("Object with a `then` method that takes callbacks", () => {
			const value = {
				then(onFulfilled: (value: number) => void) {
					onFulfilled(5);
				},
			};

			expect(isPromiseLike(value)).toBeTrue();
		});

		test("Class instance with a `then` method", () => {
			class Foo {
				then() {}
			}

			expect(isPromiseLike(new Foo())).toBeTrue();
		});

		test("Object inheriting a `then` method from its prototype", () => {
			const value = Object.create({
				then: () => {},
			});

			expect(isPromiseLike(value)).toBeTrue();
		});

		test("Object with a getter `then` returning a function", () => {
			const value = {
				get then() {
					return () => {};
				},
			};

			expect(isPromiseLike(value)).toBeTrue();
		});

		test("Array with a `then` method", () => {
			const value = Object.assign([], { then: () => {} });

			expect(isPromiseLike(value)).toBeTrue();
		});

		test("Does not call `then`", () => {
			let calls = 0;
			const value = {
				then: () => {
					calls++;
				},
			};

			isPromiseLike(value);

			expect(calls).toBe(0);
		});
	});

	describe("Non-promise-like values", () => {
		test("Null", () => {
			expect(isPromiseLike(null)).toBeFalse();
		});

		test("Undefined", () => {
			expect(isPromiseLike(undefined)).toBeFalse();
		});

		test("String", () => {
			expect(isPromiseLike("")).toBeFalse();
			expect(isPromiseLike("then")).toBeFalse();
		});

		test("Number", () => {
			expect(isPromiseLike(0)).toBeFalse();
			expect(isPromiseLike(1)).toBeFalse();
			expect(isPromiseLike(Number.NaN)).toBeFalse();
		});

		test("Boolean", () => {
			expect(isPromiseLike(true)).toBeFalse();
			expect(isPromiseLike(false)).toBeFalse();
		});

		test("Symbol", () => {
			expect(isPromiseLike(Symbol("then"))).toBeFalse();
		});

		test("BigInt", () => {
			expect(isPromiseLike(BigInt(0))).toBeFalse();
		});

		test("Empty object", () => {
			expect(isPromiseLike({})).toBeFalse();
		});

		test("Object without `then`", () => {
			expect(isPromiseLike({ foo: "bar" })).toBeFalse();
			expect(isPromiseLike({ catch: () => {}, finally: () => {} })).toBeFalse();
		});

		test("Array", () => {
			expect(isPromiseLike([])).toBeFalse();
			expect(isPromiseLike([Promise.resolve(5)])).toBeFalse();
		});

		test("Function", () => {
			expect(isPromiseLike(() => {})).toBeFalse();
			expect(isPromiseLike(async () => {})).toBeFalse();
		});

		test("Promise constructor", () => {
			expect(isPromiseLike(Promise)).toBeFalse();
		});

		test("Class instance without `then`", () => {
			class Foo {}

			expect(isPromiseLike(new Foo())).toBeFalse();
		});

		test("Error", () => {
			expect(isPromiseLike(new Error("foo"))).toBeFalse();
		});
	});

	describe("Objects with a non-function `then`", () => {
		test("String", () => {
			expect(isPromiseLike({ then: "foo" })).toBeFalse();
		});

		test("Number", () => {
			expect(isPromiseLike({ then: 5 })).toBeFalse();
		});

		test("Boolean", () => {
			expect(isPromiseLike({ then: true })).toBeFalse();
		});

		test("Null", () => {
			expect(isPromiseLike({ then: null })).toBeFalse();
		});

		test("Undefined", () => {
			expect(isPromiseLike({ then: undefined })).toBeFalse();
		});

		test("Object", () => {
			expect(isPromiseLike({ then: {} })).toBeFalse();
		});

		test("Array", () => {
			expect(isPromiseLike({ then: [] })).toBeFalse();
		});
	});

	describe("Types", () => {
		test("Narrows `unknown` to `PromiseLike<unknown>`", () => {
			const value: unknown = Promise.resolve(5);

			if (isPromiseLike(value)) {
				expectTypeOf(value).toEqualTypeOf<PromiseLike<unknown>>();
			}
		});
	});
});
