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

	test("With transformation of non existing keys", () => {
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
});
