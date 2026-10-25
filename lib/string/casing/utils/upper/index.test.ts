import { beforeEach, describe, expect, test } from "bun:test";
import { upperCase } from ".";

describe("upperCase", () => {
	beforeEach(() => {
		upperCase.config.reset();
	});

	test("Converts a string", () => {
		expect(upperCase("Hello World")).toBe("HELLO WORLD");
	});

	test("An empty string returns an empty string", () => {
		expect(upperCase("")).toBe("");
	});
});
