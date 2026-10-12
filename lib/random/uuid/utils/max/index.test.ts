import { describe, expect, test } from "bun:test";
import { uuidMax } from ".";

describe("uuidMax", () => {
	test("Returns the uuid max value", () => {
		expect(uuidMax()).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
	});
});
