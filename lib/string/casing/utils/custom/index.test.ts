import { beforeEach, describe, expect, test } from "bun:test";
import { customCase } from ".";

describe("customCase", () => {
	beforeEach(() => {
		customCase.config.reset();
	});

	test("Joins words using the given separator, without a leading separator", () => {
		expect(
			customCase("hello world", {
				seperator: "-",
				transform: (word) => word.toUpperCase(),
			}),
		).toBe("HELLO-WORLD");
	});

	test("Applies the transform to every word", () => {
		expect(
			customCase("hello world foo", {
				seperator: "_",
				transform: (word) => word.toUpperCase(),
			}),
		).toBe("HELLO_WORLD_FOO");
	});

	test("Passes the word index to the transform", () => {
		expect(
			customCase("hello world foo", {
				seperator: "-",
				transform: (word, index) => `${index}${word}`,
			}),
		).toBe("0hello-1world-2foo");
	});

	test("Supports an empty separator", () => {
		expect(
			customCase("hello world", {
				seperator: "",
				transform: (word) => word.toUpperCase(),
			}),
		).toBe("HELLOWORLD");
	});

	test("A single word does not include a separator", () => {
		expect(
			customCase("hello", {
				seperator: "-",
				transform: (word) => word.toUpperCase(),
			}),
		).toBe("HELLO");
	});

	test("An empty string returns an empty string", () => {
		expect(
			customCase("", {
				seperator: "-",
				transform: (word) => word.toUpperCase(),
			}),
		).toBe("");
	});

	test("Forwards splitOnNumbers to the underlying word split", () => {
		expect(
			customCase("foo123bar", {
				seperator: "-",
				groupNumbers: true,
				transform: (word) => word,
			}),
		).toBe("foo-123-bar");
	});

	test("Forwards groupUppercaseLetters to the underlying word split", () => {
		expect(
			customCase("HTTPServer", {
				seperator: "-",
				groupUppercaseLetters: false,
				transform: (word) => word,
			}),
		).toBe("H-T-T-P-Server");
	});

	test("Words retain their original casing unless the transform changes it", () => {
		expect(
			customCase("HTTP_server", {
				seperator: "-",
				transform: (word) => word,
			}),
		).toBe("HTTP-server");
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(customCase.config.default.groupNumbers).toBeFalse();
			expect(customCase.config.default.groupUppercaseLetters).toBeTrue();
			expect(customCase.config.default.parser).toBeUndefined();
			expect(customCase.config.groupNumbers).toBeFalse();
			expect(customCase.config.groupUppercaseLetters).toBeTrue();
			expect(customCase.config.parser).toBeUndefined();
		});

		test("Forwards splitOnNumbers to the underlying word split", () => {
			customCase.config.groupNumbers = true;

			expect(
				customCase("foo123bar", {
					seperator: "-",
					transform: (word) => word,
				}),
			).toBe("foo-123-bar");
		});

		test("Forwards groupUppercaseLetters to the underlying word split", () => {
			customCase.config.groupUppercaseLetters = false;

			expect(
				customCase("HTTPServer", {
					seperator: "-",
					transform: (word) => word,
				}),
			).toBe("H-T-T-P-Server");
		});
	});
});
