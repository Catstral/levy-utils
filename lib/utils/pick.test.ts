import { describe, expect, test } from "bun:test";
import { pick } from "./pick";

describe("pick", () => {
	test("Picking to single key with literal key", () => {
		const picked = pick({ foo: "bar", key: "value" }, "foo");
		expect(picked).not.toContainKey("key");
		expect(picked).toContainKey("foo");
		expect(picked.foo).toBe("bar");
	});

	test("Picking to single key with key array", () => {
		const picked = pick({ foo: "bar", key: "value" }, ["foo"]);
		expect(picked).not.toContainKey("key");
		expect(picked).toContainKey("foo");
		expect(picked.foo).toBe("bar");
	});

	test("Picking no values", () => {
		const picked = pick({ foo: "bar", key: "value" }, []);
		expect(picked).not.toContainAllKeys(["foo", "key"]);
		expect(picked).toBeEmptyObject();
	});
});
