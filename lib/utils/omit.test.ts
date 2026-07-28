import { describe, expect, test } from "bun:test";
import { omit } from "./omit";

describe("omit", () => {
	test("Omitting to empty object with literal key", () => {
		expect(omit({ foo: "bar" }, "foo")).toBeEmptyObject();
	});

	test("Omitting to empty object with key array", () => {
		expect(omit({ foo: "bar" }, ["foo"])).toBeEmptyObject();
	});

	test("Omitting to single key with literal key", () => {
		const omitted = omit({ foo: "bar", key: "value" }, "foo");
		expect(omitted).not.toContainKey("foo");
		expect(omitted).toContainKey("key");
		expect(omitted.key).toBe("value");
	});

	test("Omitting to single key with key array", () => {
		const omitted = omit({ foo: "bar", key: "value" }, ["foo"]);
		expect(omitted).not.toContainKey("foo");
		expect(omitted).toContainKey("key");
		expect(omitted.key).toBe("value");
	});
});
