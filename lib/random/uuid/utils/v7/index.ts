import { UtilError } from "~/error";
import { getRNG, stringifyBytes } from "../../helpers";
import type { UuidRNGOptions } from "../../types";

export class UuidV7UtilError extends UtilError {
	public readonly util = "uuidV7";
}

export interface UuidV7Options extends UuidRNGOptions {
	milliseconds?: number;
	sequence?: number;
}

/**
 * Returns a Cryptographically secure random V7 UUID string.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {UuidV7Options} [options] The options to decide how to generate the UUID
 * @returns {string} A V1 UUID string
 */
export function uuidV7(options?: UuidV7Options): string {
	const random = getRNG(options);

	if (!random) {
		throw new UuidV7UtilError("Random byte length must at least be 16");
	}

	const milis = options?.milliseconds ?? Date.now();
	const sequence = options?.sequence ?? ((random[6] & 0x7f) << 24) | (random[7] << 16) | (random[8] << 8) | random[9];
	const buffer = new Uint8Array(16);

	buffer[0] = (milis / 0x10000000000) & 0xff;
	buffer[1] = (milis / 0x100000000) & 0xff;
	buffer[2] = (milis / 0x1000000) & 0xff;
	buffer[3] = (milis / 0x10000) & 0xff;
	buffer[4] = (milis / 0x100) & 0xff;
	buffer[5] = milis & 0xff;

	buffer[6] = 0x70 | ((sequence >>> 28) & 0x0f);

	buffer[7] = (sequence >>> 20) & 0xff;

	buffer[8] = 0x80 | ((sequence >>> 14) & 0x3f);

	buffer[9] = (sequence >>> 6) & 0xff;

	buffer[10] = ((sequence << 2) & 0xff) | (random[10] & 0x03);

	buffer[11] = random[11];
	buffer[12] = random[12];
	buffer[13] = random[13];
	buffer[14] = random[14];
	buffer[15] = random[15];

	const stringified = stringifyBytes(buffer);

	if (!stringified) {
		throw new UuidV7UtilError("Something went wrong generating the UUID, a malformed UUID was detected.");
	}

	return stringified;
}

export { uuidV7 as v7 };
