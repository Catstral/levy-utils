import { describe, expect, test } from "bun:test";
import { counting } from "./counting";

describe("Counting", () => {
	test("Enum", () => {
		const counted = counting([{ type: "FOO" }, { type: "FOO" }, { type: "BAR" }], ({ type }) => type);

		expect(counted).toBeObject();
		expect(counted).toContainKeys(["FOO", "BAR"]);
		expect(counted.FOO).toBe(2);
		expect(counted.BAR).toBe(1);
	});

	test("Number", () => {
		const counted = counting([{ value: 1 }, { value: 1 }, { value: 2 }], ({ value }) => value);

		expect(counted).toBeObject();
		expect(counted).toContainKeys([1, 2]);
		expect(counted[1]).toBe(2);
		expect(counted[2]).toBe(1);
	});
});
