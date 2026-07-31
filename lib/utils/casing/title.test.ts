import { describe, expect, test } from "bun:test";
import { titleCase } from "./title";

describe("titleCase", () => {
	test("Converts a space-separated string", () => {
		expect(titleCase("hello world")).toBe("Hello World");
	});

	test("Normalizes mixed delimiters and casing", () => {
		expect(titleCase("hello-world_foo")).toBe("Hello World Foo");
	});

	test("A single word is capitalized", () => {
		expect(titleCase("hello")).toBe("Hello");
	});

	test("An empty string returns an empty string", () => {
		expect(titleCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(titleCase("hello world")).toBe("Hello World");
	});
});
