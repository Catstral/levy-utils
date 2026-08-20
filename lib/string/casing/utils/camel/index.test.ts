import { describe, expect, test } from "bun:test";
import { camelCase } from ".";

describe("camelCase", () => {
	test("Converts a space-separated string", () => {
		expect(camelCase("hello world")).toBe("helloWorld");
	});

	test("Lowercases the first word and capitalizes the rest", () => {
		expect(camelCase("hello world foo")).toBe("helloWorldFoo");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(camelCase("Hello-World_foo")).toBe("helloWorldFoo");
	});

	test("Normalizes an already-uppercased word instead of doubling its first letter", () => {
		expect(camelCase("WORLD hello")).toBe("worldHello");
	});

	test("A single word is fully lowercased", () => {
		expect(camelCase("HELLO")).toBe("hello");
	});

	test("An empty string returns an empty string", () => {
		expect(camelCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(camelCase("hello world")).toBe("helloWorld");
	});

	test("Splits a run of digits into its own word when groupNumbers is true", () => {
		expect(
			camelCase("foo123bar", {
				groupNumbers: true,
			}),
		).toBe("foo123Bar");
	});
});
