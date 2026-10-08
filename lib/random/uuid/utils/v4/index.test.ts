import { describe, expect, test } from "bun:test";
import { UuidV4UtilError, uuidV4 } from ".";

describe("uuidV4", () => {
	// See: https://www.rfc-editor.org/rfc/rfc9562.html#name-example-of-a-uuidv4-value
	test("UUID V4 test vector as defined in spec", () => {
		const expected = "919108f7-52d1-4320-9bac-f847db4148a8";

		const uuid = uuidV4({
			random: Uint8Array.of(
				0x91,
				0x91,
				0x08,
				0xf7,
				0x52,
				0xd1,
				0x43,
				0x20,
				0x9b,
				0xac,
				0xf8,
				0x47,
				0xdb,
				0x41,
				0x48,
				0xa8,
			),
		});

		expect(uuid).toBe(expected);
	});

	test("Generate a random UUID V4", () => {
		const uuid = uuidV4();

		expect(uuid).toBeString();
		expect(uuid).toHaveLength(36);
	});

	test("Expect short random vector to throw", () => {
		expect(() => {
			uuidV4({
				random: new Uint8Array(),
			});
		}).toThrow(UuidV4UtilError);
	});
});
