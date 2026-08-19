import { describe, expect, test } from "bun:test";
import { slug } from "./slug";

describe("slug", () => {
	test("Empty string", () => {
		expect(slug("")).toBe("");
	});

	test("Simple sentence", () => {
		expect(slug("Hello World")).toBe("hello-world");
	});

	test("Mixed case", () => {
		expect(slug("FooBar")).toBe("foobar");
	});

	test("Multiple consecutive spaces collapse into a single separator", () => {
		expect(slug("Hello   World")).toBe("hello-world");
	});

	test("Leading and trailing spaces produce leading/trailing separators", () => {
		expect(slug(" Hello World ")).toBe("-hello-world-");
	});

	test("Punctuation is stripped", () => {
		expect(slug("Hello, World!")).toBe("hello-world");
	});

	test("Underscores are kept as word characters", () => {
		expect(slug("foo_bar baz")).toBe("foo_bar-baz");
	});

	test("Numbers are kept", () => {
		expect(slug("Item 123")).toBe("item-123");
	});

	test("Existing hyphens are stripped instead of preserved", () => {
		expect(slug("well-known")).toBe("wellknown");
	});

	test("Tabs and newlines are stripped without introducing a separator", () => {
		expect(slug("Hello\tWorld")).toBe("helloworld");
		expect(slug("Hello\nWorld")).toBe("helloworld");
	});

	test("String of only special characters becomes empty", () => {
		expect(slug("!!!")).toBe("");
	});

	test("String of only spaces becomes a single separator", () => {
		expect(slug("   ")).toBe("-");
	});

	test("Accented/unicode characters are stripped, not transliterated", () => {
		expect(slug("Café Münchén")).toBe("caf-mnchn");
	});
});
