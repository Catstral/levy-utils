import { describe, expect, test } from "bun:test";
import { capitalize } from "./capitlize";

describe("capitlize", () => {
	test("Converts a string", () => {
		expect(capitalize("hello world")).toBe("Hello world");
	});

	test("Only the first character is converted", () => {
		expect(capitalize("hello WORLD")).toBe("Hello WORLD");
	});

	test("An empty string returns an empty string", () => {
		expect(capitalize("")).toBe("");
	});
});
