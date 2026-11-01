import { beforeEach, describe, expect, test } from "bun:test";
import { uuidNil } from ".";

describe("uuidNil", () => {
	beforeEach(() => {
		uuidNil.config.reset();
	});

	test("Returns the uuid min/nil value", () => {
		expect(uuidNil()).toBe("00000000-0000-0000-0000-000000000000");
	});
});
