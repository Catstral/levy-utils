import { describe, expect, test } from "bun:test";
import { screamingSnakeCase, snakeCase } from "./snake";

describe("snakeCase", () => {
	test("Converts a space-separated string", () => {
		expect(snakeCase("hello world")).toBe("hello_world");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(snakeCase("Hello-World_foo")).toBe("hello_world_foo");
	});

	test("Uppercases every word when screaming is true", () => {
		expect(
			snakeCase("helloWorld", {
				screaming: true,
			}),
		).toBe("HELLO_WORLD");
	});

	test("Lowercases every word by default", () => {
		expect(snakeCase("helloWorld")).toBe("hello_world");
	});

	test("A single word does not include a separator", () => {
		expect(snakeCase("HELLO")).toBe("hello");
	});

	test("An empty string returns an empty string", () => {
		expect(snakeCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(snakeCase("hello world")).toBe("hello_world");
	});
});

describe("screamingSnakeCase", () => {
	test("Converts a space-separated string", () => {
		expect(screamingSnakeCase("hello world")).toBe("HELLO_WORLD");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(screamingSnakeCase("Hello-World_foo")).toBe("HELLO_WORLD_FOO");
	});

	test("A single word does not include a separator", () => {
		expect(screamingSnakeCase("hello")).toBe("HELLO");
	});

	test("An empty string returns an empty string", () => {
		expect(screamingSnakeCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(screamingSnakeCase("helloWorld")).toBe("HELLO_WORLD");
	});
});
