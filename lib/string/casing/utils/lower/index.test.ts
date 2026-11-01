import { beforeEach, describe, expect, test } from "bun:test";
import { lowerCase } from ".";

describe("lowerCase", () => {
	beforeEach(() => {
		lowerCase.config.reset();
	});

	test("Converts a string", () => {
		expect(lowerCase("Hello World")).toBe("hello world");
	});

	test("An empty string returns an empty string", () => {
		expect(lowerCase("")).toBe("");
	});
});
