import { describe, expect, test } from "bun:test";
import { chance } from ".";

describe("maybe", () => {
	test("Returns a boolean", () => {
		expect(chance(0.5)).toBeBoolean();
	});

	test("Percentage of 1 is always true", () => {
		expect(chance(1)).toBeTrue();
	});

	test("Percentage of more than 1 is always true", () => {
		expect(chance(10)).toBeTrue();
	});

	test("Percentage of 0 is always false", () => {
		expect(chance(0)).toBeFalse();
	});

	test("Percentage of less than 0 is always false", () => {
		expect(chance(-1)).toBeFalse();
	});
});
