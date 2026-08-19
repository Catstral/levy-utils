import { describe, expect, test } from "bun:test";
import { uncapitalize } from "./uncapitlize";

describe("upperuncapitlizeCase", () => {
	test("Converts a string", () => {
		expect(uncapitalize("Hello World")).toBe("hello World");
	});

	test("Only the first character is converted", () => {
		expect(uncapitalize("Hello WORLD")).toBe("hello WORLD");
	});

	test("An empty string returns an empty string", () => {
		expect(uncapitalize("")).toBe("");
	});
});
