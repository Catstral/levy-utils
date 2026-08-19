import { describe, expect, test } from "bun:test";
import { parseUrlParams } from "./parseUrlParams";

describe("parseUrlParams", () => {
	test("Without transformation", () => {
		const parsed = parseUrlParams("https://example.com?page=2&active=true");

		expect(parsed).toBeObject();
		expect(parsed).toContainAllKeys(["page", "active"]);
		expect(parsed.page).toBe("2");
		expect(parsed.active).toBe("true");
	});

	test("With transformation", () => {
		const parsed = parseUrlParams("https://example.com?page=2&active=true", {
			page: (value) => Number(value),
			active: (value) => value === "true",
		});

		expect(parsed).toBeObject();
		expect(parsed).toContainAllKeys(["page", "active"]);
		expect(parsed.page).toBe(2);
		expect(parsed.active).toBeTrue();
	});

	test("Transformation is not applied for keys absent from the query string", () => {
		const parsed = parseUrlParams("https://example.com?page=2&active=true", {
			foo: (value) => ({ bar: value }),
		});

		expect(parsed).toBeObject();
		expect(parsed).not.toContainAllKeys(["page", "active"]);
		expect(parsed).toContainKey("foo");
		expect(parsed.foo).toBeObject();
		expect(parsed.foo).toContainKey("bar");
		expect(parsed.foo.bar).toBeUndefined();
	});

	test("Without query params", () => {
		const parsed = parseUrlParams("https://example.com");

		expect(parsed).toBeObject();
		expect(parsed).toBeEmptyObject();
	});

	test("Duplicate keys keep the last value", () => {
		const parsed = parseUrlParams("https://example.com?page=1&page=2");

		expect(parsed).toContainKey("page");
		expect(parsed.page).toBe("2");
	});

	test("Key without a value", () => {
		const parsed = parseUrlParams("https://example.com?foo");

		expect(parsed).toContainKey("foo");
		expect(parsed.foo).toBe("");
	});

	test("Key with an explicitly empty value", () => {
		const parsed = parseUrlParams("https://example.com?foo=");

		expect(parsed).toContainKey("foo");
		expect(parsed.foo).toBe("");
	});

	test("Decodes percent-encoded values", () => {
		const parsed = parseUrlParams("https://example.com?name=John%20Doe");

		expect(parsed.name).toBe("John Doe");
	});

	test("Decodes '+' as a space", () => {
		const parsed = parseUrlParams("https://example.com?name=John+Doe");

		expect(parsed.name).toBe("John Doe");
	});

	test("Ignores the hash fragment", () => {
		const parsed = parseUrlParams("https://example.com?page=1#section");

		expect(parsed).toContainAllKeys(["page"]);
		expect(parsed.page).toBe("1");
	});

	test("Invalid URL throws", () => {
		expect(() => {
			parseUrlParams("not a url");
		}).toThrow();
	});

	test("Transformation receives undefined for a missing param", () => {
		const parsed = parseUrlParams("https://example.com", {
			page: (value) => value ?? "default",
		});

		expect(parsed.page).toBe("default");
	});
});
