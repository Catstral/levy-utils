import { describe, expect, test } from "bun:test";
import { GetUtilError, get } from ".";

function expectGetError(callback: () => unknown, message: string) {
	expect(callback).toThrow(GetUtilError);
	expect(callback).toThrow(message);
}

describe("get", () => {
	describe("strict (default)", () => {
		test("Gets a top-level value", () => {
			expect(
				get(
					{
						foo: "bar",
					},
					"foo",
				),
			).toBe("bar");
		});

		test("Gets a nested value with a dot path", () => {
			const object = {
				a: {
					b: {
						c: 42,
					},
				},
			};

			expect(get(object, "a.b.c")).toBe(42);
		});

		test("Gets an intermediate object by reference", () => {
			const inner = {
				c: 1,
			};
			const object = {
				a: {
					b: inner,
				},
			};

			expect(get(object, "a.b")).toBe(inner);
		});

		test("Gets a value from an array by index", () => {
			const object = {
				list: ["a", "b", "c"],
			};

			expect(get(object, "list.1")).toBe("b");
		});

		test("Gets a value from an array of objects", () => {
			const object = {
				list: [
					{
						name: "first",
					},
					{
						name: "second",
					},
				],
			};

			expect(get(object, "list.1.name")).toBe("second");
		});

		test("Gets a value from a root array with a numeric path", () => {
			expect(get(["a", "b", "c"], 2)).toBe("c");
		});

		test("Gets a value from a root array with a nested path", () => {
			expect(
				get(
					[
						{
							id: 1,
						},
						{
							id: 2,
						},
					],
					"1.id",
				),
			).toBe(2);
		});

		test("Returns falsy values that exist", () => {
			const object = {
				zero: 0,
				empty: "",
				no: false,
				nothing: null,
				nested: {
					zero: 0,
				},
			};

			expect(get(object, "zero")).toBe(0);
			expect(get(object, "empty")).toBe("");
			expect(get(object, "no")).toBe(false);
			expect(get(object, "nothing")).toBeNull();
			expect(get(object, "nested.zero")).toBe(0);
		});

		test("Returns undefined when the key exists with an undefined value", () => {
			const object = {
				foo: undefined,
			} as const;

			expect(get(object, "foo")).toBeUndefined();
		});

		test("Does not throw when the final value is null or undefined", () => {
			const object = {
				a: {
					b: null,
					c: undefined,
				},
			};

			expect(get(object, "a.b")).toBeNull();
			expect(get(object, "a.c")).toBeUndefined();
		});

		test("Throws when the key does not exist", () => {
			expectGetError(() => {
				get(
					{
						foo: "bar",
					},
					"missing",
				);
			}, "Invalid key path, 'missing' does not exist on value");
		});

		test("Throws when a nested key does not exist", () => {
			expectGetError(() => {
				get(
					{
						a: {
							b: 1,
						},
					},
					"a.missing",
				);
			}, "Invalid key path, 'a.missing' does not exist on value");
		});

		test("Throws when an intermediate key does not exist", () => {
			expectGetError(() => {
				get(
					{
						a: {
							b: 1,
						},
					},
					"missing.b",
				);
			}, "Invalid key path, 'missing' does not exist on value");
		});

		test("Throws when traversing through a primitive", () => {
			expectGetError(() => {
				get(
					{
						a: "string",
					},
					"a.length",
				);
			}, "Invalid key path, value at 'a' is not an object");
			expectGetError(
				() =>
					get(
						{
							a: 1,
						},
						"a.b",
					),
				"Invalid key path, value at 'a' is not an object",
			);
		});

		test("Throws when traversing through null or undefined", () => {
			expectGetError(() => {
				get(
					{
						a: null,
					},
					"a.b",
				);
			}, "Invalid key path, value at 'a' is not an object");
			expectGetError(() => {
				get(
					{
						a: undefined,
					},
					"a.b",
				);
			}, "Invalid key path, value at 'a' is not an object");
		});

		test("Throws when the root value is not an object", () => {
			expectGetError(() => get(null, "a"), "Invalid key path, value is not an object");
		});

		test("Throws when an array index is out of bounds", () => {
			expectGetError(() => {
				get(
					{
						list: [1, 2],
					},
					"list.5",
				);
			}, "Invalid key path, 'list.5' does not exist on value");
		});

		test("Throws on an empty path", () => {
			expectGetError(() => {
				get(
					{
						foo: "bar",
					},
					"",
				);
			}, "Invalid key path, '' does not exist on value");
		});

		test("Thrown error identifies the `get` util", () => {
			try {
				get(
					{
						a: 1,
					},
					"a.b",
				);
			} catch (error) {
				expect(error).toBeInstanceOf(GetUtilError);
				expect(error).toBeInstanceOf(Error);
				expect((error as GetUtilError).util).toBe("get");

				return;
			}

			throw new Error("Expected `get` to throw");
		});

		test("Explicit `strict: true` behaves like the default", () => {
			expect(
				get(
					{
						foo: "bar",
					},
					"foo",
					{
						strict: true,
					},
				),
			).toBe("bar");
			expectGetError(() => {
				get(
					{
						foo: "bar",
					},
					"missing",
					{
						strict: true,
					},
				);
			}, "Invalid key path, 'missing' does not exist on value");
		});

		test("Does not mutate the original object", () => {
			const object = {
				a: {
					b: 1,
				},
			};

			get(object, "a.b");

			expect(object).toEqual({
				a: {
					b: 1,
				},
			});
		});
	});

	describe("non-strict", () => {
		test("Gets an existing value", () => {
			expect(
				get(
					{
						a: {
							b: 1,
						},
					},
					"a.b",
					{
						strict: false,
					},
				),
			).toBe(1);
		});

		test("Gets a value from an array by index", () => {
			expect(
				get(
					{
						list: ["a", "b"],
					},
					"list.1",
					{
						strict: false,
					},
				),
			).toBe("b");
		});

		test("Returns undefined when the key does not exist and no fallback is given", () => {
			expect(
				get(
					{
						foo: "bar",
					},
					"missing",
					{
						strict: false,
					},
				),
			).toBeUndefined();
		});

		test("Returns the fallback when the key does not exist", () => {
			expect(
				get(
					{
						foo: "bar",
					},
					"missing",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback when a nested key does not exist", () => {
			expect(
				get(
					{
						a: {
							b: 1,
						},
					},
					"a.missing",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback when an intermediate key does not exist", () => {
			expect(
				get(
					{
						a: {
							b: 1,
						},
					},
					"missing.b.c",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback when traversing through a primitive", () => {
			expect(
				get(
					{
						a: 1,
					},
					"a.b",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback when traversing through null or undefined", () => {
			expect(
				get(
					{
						a: null,
					},
					"a.b",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
			expect(
				get(
					{
						a: undefined,
					},
					"a.b",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback when an array index is out of bounds", () => {
			expect(
				get(
					{
						list: [1],
					},
					"list.3",
					{
						strict: false,
						fallback: -1,
					},
				),
			).toBe(-1);
		});

		test("Returns the fallback on an empty path", () => {
			expect(
				get(
					{
						foo: "bar",
					},
					"",
					{
						strict: false,
						fallback: "default",
					},
				),
			).toBe("default");
		});

		test("Returns the fallback by reference", () => {
			const fallback = {
				fallback: true,
			};

			expect(
				get(
					{
						foo: "bar",
					},
					"missing",
					{
						strict: false,
						fallback,
					},
				),
			).toBe(fallback);
		});

		test("Does not use the fallback when the value exists but is falsy", () => {
			const object = {
				zero: 0,
				empty: "",
				no: false,
				nothing: null,
			};
			const options = {
				strict: false,
				fallback: "default",
			} as const;

			expect(get(object, "zero", options)).toBe(0);
			expect(get(object, "empty", options)).toBe("");
			expect(get(object, "no", options)).toBe(false);
			expect(get(object, "nothing", options)).toBeNull();
		});

		test("Does not use the fallback when the key exists with an undefined value", () => {
			const object: {
				foo: undefined;
			} = {
				foo: undefined,
			};

			expect(
				get(object, "foo", {
					strict: false,
					fallback: "default",
				}),
			).toBeUndefined();
		});

		test("Does not throw for any invalid path", () => {
			expect(() => {
				get(
					{
						a: 1,
					},
					"x.y.z",
					{
						strict: false,
					},
				);
			}).not.toThrow();
			expect(() => {
				get(
					{
						a: 1,
					},
					"a.b.c",
					{
						strict: false,
					},
				);
			}).not.toThrow();
			expect(() => {
				get(
					{
						a: 1,
					},
					"",
					{
						strict: false,
					},
				);
			}).not.toThrow();
		});
	});
});
