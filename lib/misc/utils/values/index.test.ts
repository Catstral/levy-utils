import { describe, expect, test } from "bun:test";
import { values } from ".";

describe("values", () => {
	test("Returns values for a simple object", () => {
		const val = values({
			foo: "bar",
		});

		expect(val).toBeArrayOfSize(1);
		expect(val[0]).toBe("bar");
	});

	test("Empty object", () => {
		const val = values({});

		expect(val).toBeArrayOfSize(0);
	});

	test("Multiple keys preserve insertion order", () => {
		const val = values({
			foo: "bar",
			baz: 1,
			qux: true,
		});

		expect(val).toEqual(["bar", 1, true]);
	});

	test("Symbol keys are excluded", () => {
		const sym = Symbol("hidden");

		const value = {
			foo: "bar",
			[sym]: "hidden",
		} as Record<string, unknown>;

		const val = values(value);

		expect(val).toBeArrayOfSize(1);
		expect(val[0]).toBe("bar");
	});

	test("Non-enumerable properties are excluded", () => {
		const obj: Record<string, unknown> = {
			foo: "bar",
		};
		Object.defineProperty(obj, "hidden", {
			value: "secret",
			enumerable: false,
		});

		const val = values(obj);

		expect(val).toBeArrayOfSize(1);
		expect(val[0]).toBe("bar");
	});

	test("Returns values for an array", () => {
		const val = values([1, 2, 3]);

		expect(val).toEqual([1, 2, 3]);
	});

	test("Empty array", () => {
		const val = values([]);

		expect(val).toBeArrayOfSize(0);
	});

	test("Returns values for a Map", () => {
		const map = new Map([
			["a", 1],
			["b", 2],
		]);

		const val = values(map);

		expect(val).toEqual([1, 2]);
	});

	test("Empty Map", () => {
		const val = values(new Map());

		expect(val).toBeArrayOfSize(0);
	});

	test("Returns values for a Set", () => {
		const val = values(new Set([1, 2, 3]));

		expect(val).toEqual([1, 2, 3]);
	});

	test("Empty Set", () => {
		const val = values(new Set());

		expect(val).toBeArrayOfSize(0);
	});

	test("Returns values for a generic iterable", () => {
		function* generator() {
			yield 1;
			yield 2;
			yield 3;
		}

		const val = values(generator());

		expect(val).toEqual([1, 2, 3]);
	});

	test("Returns values for a string", () => {
		const val = values("abc");

		expect(val).toEqual(["a", "b", "c"]);
	});
});
