import { describe, expect, test } from "bun:test";
import { pascalCase } from "./pascal";

describe("pascalCase", () => {
	test("Converts a space-separated string", () => {
		expect(pascalCase("hello world")).toBe("HelloWorld");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(pascalCase("hello-world_foo")).toBe("HelloWorldFoo");
	});

	test("Preserves the casing of an acronym separated by a delimiter, only its first letter is affected", () => {
		expect(pascalCase("HTTP_server")).toBe("HTTPServer");
	});

	test("A single letter is uppercased", () => {
		expect(pascalCase("a")).toBe("A");
	});

	test("An empty string returns an empty string", () => {
		expect(pascalCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(pascalCase("hello world")).toBe("HelloWorld");
	});
});
