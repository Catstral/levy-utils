import { beforeEach, describe, expect, test } from "bun:test";
import { UuidV1UtilError, uuidV1 } from ".";

describe("uuidV1", () => {
	beforeEach(() => {
		uuidV1.config.reset();
	});

	// See: https://www.rfc-editor.org/rfc/rfc9562.html#name-example-of-a-uuidv1-value
	const rfcExpectedOutput = "c232ab00-9414-11ec-b3c8-9f68deced846";
	const clockSequence = 0x33c8;
	const node = Uint8Array.of(0x9f, 0x68, 0xde, 0xce, 0xd8, 0x46);
	const rfcSpec = {
		random: Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, clockSequence >> 8, clockSequence & 0xff, ...node),
		milliseconds: 0x17f22e279b0,
		nanoseconds: 0,
		clockSequence,
		node,
	};

	test("UUID V1 test vector as defined in spec", () => {
		const uuid = uuidV1(rfcSpec);

		expect(uuid).toBe(rfcExpectedOutput);
	});

	test("Generate a random UUID V1", () => {
		const uuid = uuidV1();

		expect(uuid).toBeString();
		expect(uuid).toHaveLength(36);
	});

	test("Expect short random vector to throw", () => {
		expect(() => {
			uuidV1({
				random: new Uint8Array(),
			});
		}).toThrow(UuidV1UtilError);
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(uuidV1.config.default.rng).toBeUndefined();
			expect(uuidV1.config.default.random).toBeUndefined();
			expect(uuidV1.config.default.milliseconds).toBeUndefined();
			expect(uuidV1.config.default.nanoseconds).toBeUndefined();
			expect(uuidV1.config.default.clockSequence).toBeUndefined();
			expect(uuidV1.config.default.node).toBeUndefined();
			expect(uuidV1.config.rng).toBeUndefined();
			expect(uuidV1.config.random).toBeUndefined();
			expect(uuidV1.config.milliseconds).toBeUndefined();
			expect(uuidV1.config.nanoseconds).toBeUndefined();
			expect(uuidV1.config.clockSequence).toBeUndefined();
			expect(uuidV1.config.node).toBeUndefined();
		});

		test("UUID V1 test vector as defined in spec", () => {
			uuidV1.config.random = rfcSpec.random;
			uuidV1.config.milliseconds = rfcSpec.milliseconds;
			uuidV1.config.nanoseconds = rfcSpec.nanoseconds;
			uuidV1.config.clockSequence = rfcSpec.clockSequence;
			uuidV1.config.node = rfcSpec.node;

			expect(uuidV1()).toBe(rfcExpectedOutput);
		});
	});
});
