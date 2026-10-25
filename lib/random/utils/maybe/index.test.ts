import { beforeEach, describe, expect, test } from "bun:test";
import { maybe } from ".";

describe("maybe", () => {
	beforeEach(() => {
		maybe.config.reset();
	});

	test("Returns a boolean", () => {
		expect(maybe()).toBeBoolean();
	});
});
