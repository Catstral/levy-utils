import { describe, expect, test } from "bun:test";
import { keys } from "./keys";

describe("keys", () => {
	test("Simple key getting", () => {
		const entr = keys({ foo: "bar" });

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBe("foo");
	});
});
