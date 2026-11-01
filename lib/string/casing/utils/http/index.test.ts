import { beforeEach, describe, expect, test } from "bun:test";
import { httpHeaderCase } from ".";

describe("httpHeaderCase", () => {
	beforeEach(() => {
		httpHeaderCase.config.reset();
	});

	test("Converts a space-separated string", () => {
		expect(httpHeaderCase("content type")).toBe("Content-Type");
	});

	test("Normalizes an underscore-separated string", () => {
		expect(httpHeaderCase("x_forwarded_for")).toBe("X-Forwarded-For");
	});

	test("Lowercases the remainder of an already-uppercased word", () => {
		expect(httpHeaderCase("CONTENT TYPE")).toBe("Content-Type");
	});

	test("A single word is capitalized", () => {
		expect(httpHeaderCase("host")).toBe("Host");
	});

	test("An empty string returns an empty string", () => {
		expect(httpHeaderCase("")).toBe("");
	});

	test("Works without options", () => {
		expect(httpHeaderCase("content type")).toBe("Content-Type");
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(httpHeaderCase.config.default.groupNumbers).toBeFalse();
			expect(httpHeaderCase.config.default.groupUppercaseLetters).toBeTrue();
			expect(httpHeaderCase.config.default.parser).toBeUndefined();
			expect(httpHeaderCase.config.groupNumbers).toBeFalse();
			expect(httpHeaderCase.config.groupUppercaseLetters).toBeTrue();
			expect(httpHeaderCase.config.parser).toBeUndefined();
		});
	});
});
