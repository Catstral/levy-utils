import { beforeEach, describe, expect, test } from "bun:test";
import { titleCase } from ".";

describe("titleCase", () => {
	beforeEach(() => {
		titleCase.config.reset();
	});

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

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(titleCase.config.default.groupNumbers).toBeFalse();
			expect(titleCase.config.default.groupUppercaseLetters).toBeTrue();
			expect(titleCase.config.default.parser).toBeUndefined();
			expect(titleCase.config.groupNumbers).toBeFalse();
			expect(titleCase.config.groupUppercaseLetters).toBeTrue();
			expect(titleCase.config.parser).toBeUndefined();
		});
	});
});
