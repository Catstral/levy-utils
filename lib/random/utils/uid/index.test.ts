import { beforeEach, describe, expect, test } from "bun:test";
import { uid } from ".";

describe("uid", () => {
	beforeEach(() => {
		uid.config.reset();
	});

	test("Returns a string", () => {
		expect(uid()).toBeString();
	});

	test("Returns a string of the specified length", () => {
		const id = uid(10);

		expect(id).toHaveLength(10);
	});

	test("Returns a string of the same character if only 1 character is inside the given charset", () => {
		const id = uid(10, "a");

		expect(id).toHaveLength(10);
		expect(id).toBe("aaaaaaaaaa");
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(uid.config.default.length).toBe(8);
			expect(uid.config.default.charset).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
			expect(uid.config.length).toBe(8);
			expect(uid.config.charset).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
		});

		test("Custom length", () => {
			uid.config.length = 10;

			expect(uid()).toHaveLength(10);
		});

		test("Custom charset", () => {
			uid.config.charset = "a";

			expect(uid()).toBe("aaaaaaaa");
		});
	});
});
