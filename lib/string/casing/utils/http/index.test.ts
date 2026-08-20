import { describe, expect, test } from "bun:test";
import { httpHeaderCase } from ".";

describe("httpHeaderCase", () => {
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
});
