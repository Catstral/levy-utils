import { describe, expect, test } from "bun:test";
import { omit } from "./omit";

describe("omit", () => {
	test("Omitting the only key (literal) results in an empty object", () => {
		expect(
			omit(
				{
					foo: "bar",
				},
				"foo",
			),
		).toBeEmptyObject();
	});

	test("Omitting the only key (array) results in an empty object", () => {
		expect(
			omit(
				{
					foo: "bar",
				},
				["foo"],
			),
		).toBeEmptyObject();
	});

	test("Omitting one of two keys (literal) leaves the other", () => {
		const omitted = omit(
			{
				foo: "bar",
				key: "value",
			},
			"foo",
		);

		expect(omitted).not.toContainKey("foo");
		expect(omitted).toContainKey("key");
		expect(omitted.key).toBe("value");
	});

	test("Omitting one of two keys (array) leaves the other", () => {
		const omitted = omit(
			{
				foo: "bar",
				key: "value",
			},
			["foo"],
		);

		expect(omitted).not.toContainKey("foo");
		expect(omitted).toContainKey("key");
		expect(omitted.key).toBe("value");
	});

	test("Omitting multiple keys with key array", () => {
		const omitted = omit(
			{
				foo: "bar",
				key: "value",
				baz: "qux",
			},
			["foo", "baz"],
		);

		expect(omitted).not.toContainKey("foo");
		expect(omitted).not.toContainKey("baz");
		expect(omitted).toContainKey("key");
		expect(omitted.key).toBe("value");
	});

	test("Omitting a key that does not exist on the object", () => {
		const original = {
			foo: "bar",
		};

		const omitted = omit(original, "key" as "foo");

		expect(omitted).toContainKey("foo");
		expect((omitted as typeof original).foo).toBe("bar");
	});

	test("Omitting with an empty key array keeps all keys", () => {
		const omitted = omit(
			{
				foo: "bar",
				key: "value",
			},
			[],
		);

		expect(omitted).toContainAllKeys(["foo", "key"]);
	});

	test("Does not mutate the original object", () => {
		const original = {
			foo: "bar",
			key: "value",
		};

		const omitted = omit(original, "foo");

		expect(omitted).not.toContainKey("foo");
		expect(original).toContainKey("foo");
		expect(original.foo).toBe("bar");
	});
});
