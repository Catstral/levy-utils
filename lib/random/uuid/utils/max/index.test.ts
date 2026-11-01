import { beforeEach, describe, expect, test } from "bun:test";
import { uuidMax } from ".";

describe("uuidMax", () => {
	beforeEach(() => {
		uuidMax.config.reset();
	});

	test("Returns the uuid max value", () => {
		expect(uuidMax()).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
	});
});
