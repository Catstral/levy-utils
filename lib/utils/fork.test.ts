import { describe, expect, test } from "bun:test";
import { fork } from "./fork";

describe("fork", () => {
	test("Simple condition", () => {
		const forked = fork(["foo", "bar"], (val) => val === "foo");

		expect(forked).toBeArrayOfSize(2);
		expect(forked[0]).toBeArrayOfSize(1);
		expect(forked[0][0]).toBe("foo");
		expect(forked[1]).toBeArrayOfSize(1);
		expect(forked[1][0]).toBe("bar");
	});
});
