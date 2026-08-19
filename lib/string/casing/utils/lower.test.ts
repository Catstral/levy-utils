import { describe, expect, test } from "bun:test";
import { lowerCase } from "./lower";

describe("lowerCase", () => {
	test("Converts a string", () => {
		expect(lowerCase("Hello World")).toBe("hello world");
	});

	test("An empty string returns an empty string", () => {
		expect(lowerCase("")).toBe("");
	});
});
