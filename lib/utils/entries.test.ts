import { describe, expect, test } from "bun:test";
import { entries } from "./entries";

describe("entries", () => {
	test("Simple entry getting", () => {
		const entr = entries({ foo: "bar" });

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBeArrayOfSize(2);
		expect(entr[0][0]).toBe("foo");
		expect(entr[0][1]).toBe("bar");
	});
});
