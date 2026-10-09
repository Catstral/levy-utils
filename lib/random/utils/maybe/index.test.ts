import { describe, expect, test } from "bun:test";
import { maybe } from ".";

describe("maybe", () => {
	test("Returns a boolean", () => {
		expect(maybe()).toBeBoolean();
	});
});
