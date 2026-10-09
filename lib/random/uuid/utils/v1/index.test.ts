import { describe, expect, test } from "bun:test";
import { UuidV1UtilError, uuidV1 } from ".";

describe("uuidV1", () => {
	// See: https://www.rfc-editor.org/rfc/rfc9562.html#name-example-of-a-uuidv1-value
	test("UUID V1 test vector as defined in spec", () => {
		const expected = "c232ab00-9414-11ec-b3c8-9f68deced846";

		const clockSequence = 0x33c8;
		const node = Uint8Array.of(0x9f, 0x68, 0xde, 0xce, 0xd8, 0x46);

		const uuid = uuidV1({
			random: Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, clockSequence >> 8, clockSequence & 0xff, ...node),
			milliseconds: 0x17f22e279b0,
			nanoseconds: 0,
			clockSequence,
			node,
		});

		expect(uuid).toBe(expected);
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
});
