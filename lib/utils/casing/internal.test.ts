import { describe, expect, test } from "bun:test";
import { splitCasing } from "./internal";

describe("splitCasing", () => {
	test("Splits on whitespace", () => {
		expect(splitCasing("hello world")).toEqual(["hello", "world"]);
	});

	test("Splits on hyphens and underscores", () => {
		expect(splitCasing("foo_bar-baz qux")).toEqual(["foo", "bar", "baz", "qux"]);
	});

	test("Splits on a casing change", () => {
		expect(splitCasing("helloWorldFoo")).toEqual(["hello", "World", "Foo"]);
	});

	test("Groups consecutive uppercase letters into a single word by default", () => {
		expect(splitCasing("HTTPServer")).toEqual(["HTTPServer"]);
	});

	test("Groups consecutive uppercase letters separated by a delimiter into their own word", () => {
		expect(splitCasing("HTTP_server")).toEqual(["HTTP", "server"]);
	});

	test("Splits every uppercase letter into its own word when groupUppercaseLetters is false", () => {
		expect(
			splitCasing("HTTPServer", {
				groupUppercaseLetters: false,
			}),
		).toEqual(["H", "T", "T", "P", "Server"]);
	});

	test("Keeps a run of digits attached to the previous word by default", () => {
		expect(splitCasing("foo123bar")).toEqual(["foo123bar"]);
	});

	test("Keeps a run of digits attached to the previous word when splitOnNumbers is false", () => {
		expect(
			splitCasing("foo123bar", {
				splitOnNumbers: false,
			}),
		).toEqual(["foo123bar"]);
	});

	test("Splits a run of digits into its own word when splitOnNumbers is true", () => {
		expect(
			splitCasing("foo123bar", {
				splitOnNumbers: true,
			}),
		).toEqual(["foo", "123", "bar"]);
	});

	test("Starts a new word when a run of digits is followed by an uppercase letter", () => {
		expect(
			splitCasing("foo123Bar", {
				splitOnNumbers: true,
			}),
		).toEqual(["foo", "123", "Bar"]);
	});

	test("Starts a new word when a run of digits is at the start of the string", () => {
		expect(
			splitCasing("123bar", {
				splitOnNumbers: true,
			}),
		).toEqual(["123", "bar"]);
	});

	test("A run of digits at the end of the string is its own word", () => {
		expect(
			splitCasing("foo123", {
				splitOnNumbers: true,
			}),
		).toEqual(["foo", "123"]);
	});

	test("Preserves the original casing of every word, regardless of its position", () => {
		expect(splitCasing("FOO_bar_Baz")).toEqual(["FOO", "bar", "Baz"]);
	});

	test("Trims and collapses surrounding/repeated whitespace", () => {
		expect(splitCasing("  hello   world  ")).toEqual(["hello", "world"]);
	});

	test("An empty string returns an empty array", () => {
		expect(splitCasing("")).toEqual([]);
	});

	test("A string of only whitespace returns an empty array", () => {
		expect(splitCasing("   ")).toEqual([]);
	});

	test("A single word returns a single-item array", () => {
		expect(splitCasing("hello")).toEqual(["hello"]);
	});
});
