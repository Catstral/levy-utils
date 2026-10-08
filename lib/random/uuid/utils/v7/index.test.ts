import { describe, expect, test } from "bun:test";
import { UuidV7UtilError, uuidV7 } from ".";

describe("uuidV7", () => {
	// See: https://www.rfc-editor.org/rfc/rfc9562.html#name-example-of-a-uuidv7-value
	test("UUID V7 test vector as defined in spec", () => {
		const expected = "017f22e2-79b0-7cc3-98c4-dc0c0c07398f";

		// TODO: fix byte sequence to  value as per example vector
		const uuid = uuidV7({
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
			miliseconds: 0x017f22e279b0,
		});

		expect(uuid).toBe(expected);
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
});
