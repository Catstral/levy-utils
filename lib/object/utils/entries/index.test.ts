import { describe, expect, test } from "bun:test";
import { entries } from ".";

describe("entries", () => {
	test("Returns key-value pairs for a simple object", () => {
		const entr = entries({
			foo: "bar",
		});

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBeArrayOfSize(2);
		expect(entr[0][0]).toBe("foo");
		expect(entr[0][1]).toBe("bar");
	});

	test("Empty object", () => {
		const entr = entries({});

		expect(entr).toBeArrayOfSize(0);
	});

	test("Multiple keys preserve insertion order", () => {
		const entr = entries({
			foo: "bar",
			baz: 1,
			qux: true,
		});

		expect(entr).toEqual([
			["foo", "bar"],
			["baz", 1],
			["qux", true],
		]);
	});

	test("Integer-like keys are ordered numerically ahead of string keys", () => {
		const entr = entries({
			"2": "b",
			foo: "bar",
			"1": "a",
		});

		expect(entr).toEqual([
			["1", "a"],
			["2", "b"],
			["foo", "bar"],
		]);
	});

	test("Symbol keys are excluded", () => {
		const sym = Symbol("hidden");

		const value = {
			foo: "bar",
			[sym]: "hidden",
		} as Record<string, unknown>;

		const entr = entries(value);

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toEqual(["foo", "bar"]);
	});
});
