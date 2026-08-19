import { describe, expect, test } from "bun:test";
import { pick } from ".";

describe("pick", () => {
	test("Picking one of two keys (literal) returns only that key", () => {
		const picked = pick(
			{
				foo: "bar",
				key: "value",
			},
			"foo",
		);

		expect(picked).not.toContainKey("key");
		expect(picked).toContainKey("foo");
		expect(picked.foo).toBe("bar");
	});

	test("Picking one of two keys (array) returns only that key", () => {
		const picked = pick(
			{
				foo: "bar",
				key: "value",
			},
			["foo"],
		);

		expect(picked).not.toContainKey("key");
		expect(picked).toContainKey("foo");
		expect(picked.foo).toBe("bar");
	});

	test("Picking with an empty key array returns an empty object", () => {
		const picked = pick(
			{
				foo: "bar",
				key: "value",
			},
			[],
		);

		expect(picked).not.toContainAllKeys(["foo", "key"]);
		expect(picked).toBeEmptyObject();
	});

	test("Picking multiple keys with key array", () => {
		const picked = pick(
			{
				foo: "bar",
				key: "value",
				other: "thing",
			},
			["foo", "other"],
		);

		expect(picked).toContainAllKeys(["foo", "other"]);
		expect(picked).not.toContainKey("key");
		expect(picked.foo).toBe("bar");
		expect(picked.other).toBe("thing");
	});

	test("Picking every key returns an object equal to the original", () => {
		const object = {
			foo: "bar",
			key: "value",
		};
		const picked = pick(object, ["foo", "key"]);

		expect(picked).toEqual(object);
	});

	test("Does not mutate the original object", () => {
		const object = {
			foo: "bar",
			key: "value",
		};

		pick(object, "foo");

		expect(object).toEqual({ foo: "bar", key: "value" });
	});

	test("Returns a new object reference", () => {
		const object = {
			foo: "bar",
		};
		const picked = pick(object, "foo");

		expect(picked).not.toBe(object);
	});

	test("Picked values are shallow copied by reference", () => {
		const nested = {
			nested: true,
		};
		const picked = pick(
			{
				foo: nested,
			},
			"foo",
		);

		expect(picked.foo).toBe(nested);
	});

	test("Picking a key that does not exist on the object still sets it to undefined", () => {
		const object: { foo: string } = {
			foo: "bar",
		};

		const picked = pick(object, "missing" as unknown as keyof typeof object);

		expect(picked).toContainKey("missing" as unknown as keyof typeof object);
		expect((picked as unknown as { missing: undefined }).missing).toBeUndefined();
	});

	test("Duplicate keys in the key array only produce a single entry", () => {
		const picked = pick(
			{
				foo: "bar",
				key: "value",
			},
			["foo", "foo"],
		);

		expect(Object.keys(picked)).toEqual(["foo"]);
		expect(picked.foo).toBe("bar");
	});

	test("Picking a key whose value is already undefined keeps the key", () => {
		const picked = pick(
			{
				foo: undefined,
			},
			"foo",
		);

		expect(picked).toContainKey("foo");
		expect(picked.foo).toBeUndefined();
	});
});
