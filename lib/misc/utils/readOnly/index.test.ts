import { describe, expect, test } from "bun:test";
import { isReadOnly, readOnly } from ".";

describe("isReadOnly", () => {
	test("Plain mutable object", () => {
		expect(isReadOnly({ foo: "bar" })).toBeFalse();
	});

	test("Plain mutable array", () => {
		expect(isReadOnly([1, 2, 3])).toBeFalse();
	});

	test("Frozen object", () => {
		expect(isReadOnly(Object.freeze({ foo: "bar" }))).toBeTrue();
	});

	test("Frozen array", () => {
		const arr = [1, 2, 3];

		expect(isReadOnly(Object.freeze(arr))).toBeTrue();
	});

	test("Freezing a different object does not affect this one", () => {
		const object = { foo: "bar" };
		Object.freeze({ foo: "bar" });

		expect(isReadOnly(object)).toBeFalse();
	});
});

describe("readOnly", () => {
	describe("Shallow (default)", () => {
		test("Result is frozen (object)", () => {
			expect(Object.isFrozen(readOnly({ foo: "bar" }))).toBeTrue();
		});

		test("Result is frozen (array)", () => {
			expect(Object.isFrozen(readOnly([1, 2, 3]))).toBeTrue();
		});

		test("Result is a different reference than the input", () => {
			const original = { foo: "bar" };

			expect(readOnly(original)).not.toBe(original as never);
		});

		test("Original input remains unfrozen and mutable", () => {
			const original = { foo: "bar" };
			readOnly(original);

			expect(Object.isFrozen(original)).toBeFalse();
			original.foo = "baz";
			expect(original.foo).toBe("baz");
		});

		test("Assigning a top-level property on the result throws", () => {
			const result = readOnly({
				foo: "bar",
			});

			expect(() => {
				// Intentionally mutating a frozen object for the test
				(result as Record<string, unknown>).foo = "baz";
			}).toThrow();
		});

		test("Nested object under the result is not frozen and remains mutable", () => {
			const result = readOnly({
				nested: {
					foo: "bar",
				},
			});

			expect(Object.isFrozen(result.nested)).toBeFalse();

			(result.nested as Record<string, unknown>).foo = "baz";

			expect(result.nested.foo as string).toBe("baz");
		});

		test("Nested object keeps the same reference as the original", () => {
			const nested = { foo: "bar" };
			const original = { nested };

			expect(readOnly(original).nested).toBe(nested);
		});

		test("Result is a different Map reference than the input and is frozen", () => {
			const original = new Map([["a", 1]]);
			const result = readOnly(original);

			expect(result).not.toBe(original as never);
			expect(Object.isFrozen(result)).toBeTrue();
		});

		test("Original Map remains unfrozen and mutable", () => {
			const original = new Map([["a", 1]]);
			readOnly(original);

			expect(Object.isFrozen(original)).toBeFalse();

			original.set("b", 2);

			expect(original.get("b")).toBe(2);
		});

		test("Map values keep the same reference as the original", () => {
			const value = { foo: "bar" };
			const original = new Map([["a", value]]);

			expect(readOnly(original).get("a")).toBe(value);
		});

		test("Result is a different Set reference than the input and is frozen", () => {
			const original = new Set([1, 2, 3]);
			const result = readOnly(original);

			expect(result).not.toBe(original as never);
			expect(Object.isFrozen(result)).toBeTrue();
		});

		test("Original Set remains unfrozen and mutable", () => {
			const original = new Set([1, 2, 3]);
			readOnly(original);

			expect(Object.isFrozen(original)).toBeFalse();

			original.add(4);

			expect(original.has(4)).toBeTrue();
		});
	});

	describe("Deep (deepFreeze: true)", () => {
		test("Result and nested object are frozen", () => {
			const result = readOnly(
				{
					nested: {
						foo: "bar",
					},
				},
				true,
			);

			expect(Object.isFrozen(result)).toBeTrue();
			expect(Object.isFrozen(result.nested)).toBeTrue();
		});

		test("Result and nested array are frozen", () => {
			const result = readOnly(
				{
					nested: [1, 2, 3],
				},
				true,
			);

			expect(Object.isFrozen(result)).toBeTrue();
			expect(Object.isFrozen(result.nested)).toBeTrue();
		});

		test("Object nested inside an array is frozen", () => {
			const result = readOnly(
				{
					items: [
						{
							foo: "bar",
						},
					],
				},
				true,
			);

			expect(Object.isFrozen(result.items[0])).toBeTrue();
		});

		test("Multiple levels of nesting are all frozen", () => {
			const result = readOnly({ a: { b: { c: { foo: "bar" } } } }, true);

			expect(Object.isFrozen(result.a)).toBeTrue();
			expect(Object.isFrozen(result.a.b)).toBeTrue();
			expect(Object.isFrozen(result.a.b.c)).toBeTrue();
		});

		test("Assigning a nested property on the result throws", () => {
			const result = readOnly(
				{
					nested: {
						foo: "bar",
					},
				},
				true,
			);

			expect(() => {
				(result.nested as Record<string, unknown>).foo = "baz";
			}).toThrow();
		});

		test("Does not freeze the original object's nested properties", () => {
			const original = {
				nested: {
					foo: "bar",
				},
			};

			readOnly(original, true);

			expect(Object.isFrozen(original)).toBeFalse();
			expect(Object.isFrozen(original.nested)).toBeFalse();

			original.nested.foo = "baz";

			expect(original.nested.foo).toBe("baz");
		});

		test("Mutating the original's nested object after the call does not affect the frozen result", () => {
			const original = { nested: { foo: "bar" } };
			const result = readOnly(original, true);

			original.nested.foo = "baz";

			expect(result.nested.foo).toBe("bar");
		});

		test("Handles null values without throwing", () => {
			expect(() => readOnly({ foo: null }, true)).not.toThrow();
		});

		test("Handles primitive-only arrays and objects without throwing", () => {
			expect(() => readOnly({ a: 1, b: "two", c: true }, true)).not.toThrow();
			expect(() => readOnly([1, "two", true, null], true)).not.toThrow();
		});

		test("Map values are recursively cloned and frozen", () => {
			const value = { foo: "bar" };
			const original = new Map([["a", value]]);
			const result = readOnly(original, true);

			expect(Object.isFrozen(result)).toBeTrue();
			expect(result.get("a")).not.toBe(value);
			expect(Object.isFrozen(result.get("a"))).toBeTrue();
		});

		test("Set values are recursively cloned and frozen", () => {
			const value = { foo: "bar" };
			const original = new Set([value]);
			const result = readOnly(original, true);

			expect(Object.isFrozen(result)).toBeTrue();

			for (const item of result) {
				expect(item).not.toBe(value);
				expect(Object.isFrozen(item)).toBeTrue();
			}
		});

		test("Mutating the original Map's nested object after the call does not affect the frozen result", () => {
			const nested = { foo: "bar" };
			const original = new Map([["a", nested]]);
			const result = readOnly(original, true);

			nested.foo = "baz";

			expect((result.get("a") as { foo: string }).foo).toBe("bar");
		});
	});
});
