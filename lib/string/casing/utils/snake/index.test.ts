import { beforeEach, describe, expect, test } from "bun:test";
import { screamingSnakeCase, snakeCase } from ".";

describe("snakeCase", () => {
	beforeEach(() => {
		snakeCase.config.reset();
	});

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

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(snakeCase.config.default.groupNumbers).toBeFalse();
			expect(snakeCase.config.default.groupUppercaseLetters).toBeTrue();
			expect(snakeCase.config.default.parser).toBeUndefined();
			expect(snakeCase.config.default.screaming).toBeFalse();
			expect(snakeCase.config.groupNumbers).toBeFalse();
			expect(snakeCase.config.groupUppercaseLetters).toBeTrue();
			expect(snakeCase.config.parser).toBeUndefined();
			expect(snakeCase.config.screaming).toBeFalse();
		});

		test("Uppercases every word when screaming is true", () => {
			snakeCase.config.screaming = true;

			expect(snakeCase("helloWorld")).toBe("HELLO_WORLD");
		});
	});
});

describe("screamingSnakeCase", () => {
	beforeEach(() => {
		screamingSnakeCase.config.reset();
	});

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

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(screamingSnakeCase.config.default.groupNumbers).toBeFalse();
			expect(screamingSnakeCase.config.default.groupUppercaseLetters).toBeTrue();
			expect(screamingSnakeCase.config.default.parser).toBeUndefined();
			expect(screamingSnakeCase.config.groupNumbers).toBeFalse();
			expect(screamingSnakeCase.config.groupUppercaseLetters).toBeTrue();
			expect(screamingSnakeCase.config.parser).toBeUndefined();
		});
	});
});
