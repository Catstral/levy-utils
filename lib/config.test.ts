import { describe, expect, test } from "bun:test";
import { createUtilConfig } from "./config";

describe("createUtilConfig", () => {
	test("Initial value is equal to default value", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		expect(config.foo).toBe("bar");
	});

	test("Reading default values", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		expect(config.default.foo).toBe("bar");
	});

	test("Changing the config value", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		config.foo = "override";

		expect(config.foo).toBe("override");
	});

	test("Changing the config value does not touch the default values", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		config.foo = "override";

		expect(config.foo).toBe("override");
		expect(config.default.foo).toBe("bar");
	});

	test("Resetting config goes back to default values", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		config.foo = "override";

		expect(config.foo).toBe("override");

		config.reset();

		expect(config.foo).toBe("bar");
	});

	test("Cannot change defaults inside `config.default`", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		expect(() => {
			// @ts-expect-error
			config.default.foo = "override";
		}).toThrow();
	});

	test("Cannot extend `config.default` with new keys", () => {
		const config = createUtilConfig({
			foo: {
				default: () => "bar",
			},
		});

		expect(() => {
			// @ts-expect-error
			config.default.new = "override";
		}).toThrow();
	});
});
