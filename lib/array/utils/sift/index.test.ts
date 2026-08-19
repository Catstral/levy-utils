import { describe, expect, test } from "bun:test";
import { sift } from ".";

describe("sift", () => {
	test("Empty list", () => {
		expect(sift([])).toBeArrayOfSize(0);
	});

	test("Removes all falsy values", () => {
		const sifted = sift([false, 0, 0n, "", null, undefined]);

		expect(sifted).toBeArrayOfSize(0);
	});

	test("Keeps all truthy values", () => {
		const sifted = sift([1, "foo", true, {}, []]);

		expect(sifted).toBeArrayOfSize(5);
	});

	test("Mixed list keeps only truthy values in original order", () => {
		const sifted = sift([0, "foo", null, 1, undefined, "bar", false]);

		expect(sifted).toEqual(["foo", 1, "bar"]);
	});

	test("Falsy values mixed between objects and arrays", () => {
		const obj = {
			foo: "bar",
		};
		const arr = [1, 2, 3];
		const sifted = sift([null, obj, undefined, arr, ""]);

		expect(sifted).toEqual([obj, arr]);
	});
});
