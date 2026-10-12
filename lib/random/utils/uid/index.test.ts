import { describe, expect, test } from "bun:test";
import { uid } from ".";

describe("uid", () => {
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
});
