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

	test("Non-enumerable properties from the original object are preserved", () => {
		const original = Object.defineProperty({ foo: "bar" }, "hidden", {
			value: "secret",
			enumerable: false,
		}) as { foo: string; hidden: string };

		const extended = extend(original, { key: "value" });

		expect(extended.hidden).toBe("secret");
		expect(Object.getOwnPropertyDescriptor(extended, "hidden")?.enumerable).toBe(false);
		expect(Object.keys(extended)).not.toContain("hidden");
	});

	test("Non-enumerable properties from the other object are added and remain non-enumerable", () => {
		const other = Object.defineProperty({}, "hidden", {
			value: "secret",
			enumerable: false,
		}) as { hidden: string };

		const extended = extend({ foo: "bar" }, other);

		expect(extended.hidden).toBe("secret");
		expect(Object.getOwnPropertyDescriptor(extended, "hidden")?.enumerable).toBe(false);
		expect(Object.keys(extended)).not.toContain("hidden");
	});

	test("A non-enumerable property on the other object overrides an enumerable one on the original", () => {
		const original = { foo: "bar" };
		const other = Object.defineProperty({}, "foo", {
			value: "baz",
			enumerable: false,
		});

		const extended = extend(original, other);

		expect(extended.foo).toBe("baz");
		expect(Object.getOwnPropertyDescriptor(extended, "foo")?.enumerable).toBe(false);
	});

	test("Symbol keys from the original object are preserved", () => {
		const symbolKey = Symbol("symbolKey");
		const original = { foo: "bar", [symbolKey]: "symbolValue" };

		const extended = extend(original, { key: "value" });

		expect(extended[symbolKey]).toBe("symbolValue");
	});

	test("Symbol keys from the other object are added", () => {
		const symbolKey = Symbol("symbolKey");
		const other = { [symbolKey]: "symbolValue" };

		const extended = extend({ foo: "bar" }, other);

		expect(extended[symbolKey]).toBe("symbolValue");
	});

	test("A shared symbol key on the other object overrides the value on the original", () => {
		const symbolKey = Symbol("symbolKey");
		const original = { [symbolKey]: "original" };
		const other = { [symbolKey]: "overridden" };

		const extended = extend(original, other);

		expect(extended[symbolKey]).toBe("overridden");
	});
});
