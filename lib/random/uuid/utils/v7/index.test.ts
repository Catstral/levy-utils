import { beforeEach, describe, expect, test } from "bun:test";
import { UuidV7UtilError, uuidV7 } from ".";

describe("uuidV7", () => {
	beforeEach(() => {
		uuidV7.config.reset();
	});

	// See: https://www.rfc-editor.org/rfc/rfc9562.html#name-example-of-a-uuidv7-value
	const rfcExpectedOutput = "017f22e2-79b0-7cc3-98c4-dc0c0c07398f";
	const rfcSpec = {
		random: Uint8Array.of(
			0x10,
			0x7f,
			0x22,
			0xe2,
			0x79,
			0xb0,
			0x7c,
			0xc3,
			0x98,
			0xc4,
			0xdc,
			0x0c,
			0x0c,
			0x07,
			0x39,
			0x8f,
		),
		sequence: 0xcc363137,
		milliseconds: 0x017f22e279b0,
	};

	test("UUID V7 test vector as defined in spec", () => {
		const uuid = uuidV7(rfcSpec);

		expect(uuid).toBe(rfcExpectedOutput);
	});

	test("Generate a random UUID V7", () => {
		const uuid = uuidV7();

		expect(uuid).toBeString();
		expect(uuid).toHaveLength(36);
	});

	test("Expect short random vector to throw", () => {
		expect(() => {
			uuidV7({
				random: new Uint8Array(),
			});
		}).toThrow(UuidV7UtilError);
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(uuidV7.config.default.rng).toBeUndefined();
			expect(uuidV7.config.default.random).toBeUndefined();
			expect(uuidV7.config.default.milliseconds).toBeUndefined();
			expect(uuidV7.config.default.sequence).toBeUndefined();
			expect(uuidV7.config.rng).toBeUndefined();
			expect(uuidV7.config.random).toBeUndefined();
			expect(uuidV7.config.milliseconds).toBeUndefined();
			expect(uuidV7.config.sequence).toBeUndefined();
		});

		test("UUID V1 test vector as defined in spec", () => {
			uuidV7.config.random = rfcSpec.random;
			uuidV7.config.milliseconds = rfcSpec.milliseconds;
			uuidV7.config.sequence = rfcSpec.sequence;

			expect(uuidV7()).toBe(rfcExpectedOutput);
		});
	});
});
