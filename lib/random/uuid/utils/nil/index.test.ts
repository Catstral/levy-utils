import { describe, expect, test } from "bun:test";
import { uuidNil } from ".";

describe("uuidMax", () => {
	test("Returns the uuid min/nil value", () => {
		expect(uuidNil()).toBe("00000000-0000-0000-0000-000000000000");
	});
});
