import { describe, expect, test } from "bun:test";
import { noop } from ".";

describe("noop", () => {
	test("Doesn't throw when called", () => {
		expect(noop).not.toThrow();
	});

	test("Doesn't throw when called with arguments", () => {
		expect(() => (noop as (...args: unknown[]) => void)(10, true)).not.toThrow();
	});
});
