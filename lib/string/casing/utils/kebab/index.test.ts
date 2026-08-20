import { describe, expect, test } from "bun:test";
import { kebabCase, screamingKebabCase } from ".";

describe("kebabCase", () => {
	test("Converts a space-separated string", () => {
		expect(kebabCase("hello world")).toBe("hello-world");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(kebabCase("Hello-World_foo")).toBe("hello-world-foo");
	});

	test("Uppercases every word when screaming is true", () => {
		expect(
			kebabCase("helloWorld", {
				screaming: true,
			}),
		).toBe("HELLO-WORLD");
	});

	test("Lowercases every word when screaming is false", () => {
		expect(
			kebabCase("helloWorld", {
				screaming: false,
			}),
		).toBe("hello-world");
	});

	test("A single word does not include a separator", () => {
		expect(kebabCase("HELLO")).toBe("hello");
	});

	test("An empty string returns an empty string", () => {
		expect(kebabCase("")).toBe("");
	});

	test("Works without an options argument", () => {
		expect(kebabCase("hello world")).toBe("hello-world");
	});

	test("Works with an empty options object", () => {
		expect(kebabCase("hello world", {})).toBe("hello-world");
	});
});

describe("screamingKebabCase", () => {
	test("Converts a space-separated string", () => {
		expect(screamingKebabCase("hello world")).toBe("HELLO-WORLD");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(screamingKebabCase("Hello-World_foo")).toBe("HELLO-WORLD-FOO");
	});

	test("A single word does not include a separator", () => {
		expect(screamingKebabCase("hello")).toBe("HELLO");
	});

	test("An empty string returns an empty string", () => {
		expect(screamingKebabCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(screamingKebabCase("helloWorld")).toBe("HELLO-WORLD");
	});
});
