import { describe, expect, test } from "bun:test";
import { extend } from ".";

describe("extend", () => {
	test("Extending with a non-overlapping object merges both objects' keys", () => {
		const extended = extend(
			{
				foo: "bar",
			},
			{
				key: "value",
			},
		);

		expect(extended).toContainAllKeys(["foo", "key"]);
		expect(extended.foo).toBe("bar");
		expect(extended.key).toBe("value");
	});

	test("Extending with an overlapping key overrides the original value", () => {
		const extended = extend(
			{
				foo: "bar",
			},
			{
				foo: "baz",
			},
		);

		expect(extended.foo).toBe("baz");
	});

	test("Extending with an empty object keeps the original keys and values", () => {
		const extended = extend(
			{
				foo: "bar",
				key: "value",
			},
			{},
		);

		expect(extended).toContainAllKeys(["foo", "key"]);
		expect(extended.foo).toBe("bar");
		expect(extended.key).toBe("value");
	});

	test("Extending an empty object adds all of the other object's keys", () => {
		const extended = extend(
			{},
			{
				foo: "bar",
			},
		);

		expect(extended).toContainAllKeys(["foo"]);
		expect(extended.foo).toBe("bar");
	});

	test("Does not mutate the original object", () => {
		const original = {
			foo: "bar",
		};

		extend(original, { foo: "baz" });

		expect(original.foo).toBe("bar");
	});

	test("Does not mutate the other object", () => {
		const other = {
			foo: "baz",
		};

		extend({ foo: "bar" }, other);

		expect(other.foo).toBe("baz");
	});

	test("Returns a new object reference", () => {
		const original = {
			foo: "bar",
		};
		const other = {
			key: "value",
		};

		const extended = extend(original, other);

		expect(extended).not.toBe(original);
		expect(extended).not.toBe(other);
	});

	test("Non-overridden values are shallow copied by reference", () => {
		const nested = {
			nested: true,
		};

		const extended = extend(
			{
				foo: nested,
			},
			{
				key: "value",
			},
		);

		expect(extended.foo).toBe(nested);
	});
});
