import { describe, expect, test } from "bun:test";
import { keys } from "./keys";

describe("keys", () => {
	test("Returns keys for a simple object", () => {
		const entr = keys({
			foo: "bar",
		});

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBe("foo");
	});

	test("Empty object", () => {
		const entr = keys({});

		expect(entr).toBeArrayOfSize(0);
	});

	test("Multiple keys preserve insertion order", () => {
		const entr = keys({
			b: 1,
			a: 2,
			c: 3,
		});

		expect(entr).toBeArrayOfSize(3);
		expect(entr).toEqual(["b", "a", "c"]);
	});

	test("Symbol keys are excluded", () => {
		const sym = Symbol("sym");
		const entr = keys({
			[sym]: "value",
			foo: "bar",
		} as Record<string, unknown>);

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBe("foo");
	});

	test("Non-enumerable properties are excluded", () => {
		const obj: Record<string, unknown> = {
			foo: "bar",
		};
		Object.defineProperty(obj, "hidden", {
			value: "secret",
			enumerable: false,
		});

		const entr = keys(obj);

		expect(entr).toBeArrayOfSize(1);
		expect(entr[0]).toBe("foo");
	});
});
