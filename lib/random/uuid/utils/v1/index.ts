import { UtilError } from "~/error";
import { getRNG, stringifyBytes } from "../../helpers";
import type { UuidRNGOptions } from "../../types";

export class UuidV1UtilError extends UtilError {
	public readonly util = "uuidV1";
}

export interface UuidV1Options extends UuidRNGOptions {}

/**
 * Returns a Cryptographically secure random V1 UUID string.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {UuidV1Options} [options] The options to decide how to generate the UUID
 * @returns {string} A V1 UUID string
 */
export function uuidV1(options?: UuidV1Options): string {
	const random = getRNG(options);

	if (!random) {
		throw new UuidV1UtilError("Random byte length must at least be 16");
	}

	// NOTE: the milis and nanos split is because it requires 57+ bit numbers, but JS doesn't offer that precision.
	// Offset to Gregorian epoch
	// https://www.rfc-editor.org/rfc/rfc9562.html#section-5.1-1
	const milis = Date.now() + 12219292800000;
	const nanos = 0;
	const clockSequence = ((random[8] << 8) | random[9]) & 0x3fff;
	const buffer = new Uint8Array(16);
	const node = random.slice(10, 16);

	// Set multicast bit
	// https://www.rfc-editor.org/rfc/rfc9562.html#section-6.10-3
	node[0] | 0x01;

	let offset = 0;

	const timestamp = (milis & 0xfffffff) * 10000 + nanos;
	const timeLow = timestamp >>> 0;

	buffer[offset] = (timeLow >>> 24) & 0xff;
	offset += 1;
	buffer[offset] = (timeLow >>> 16) & 0xff;
	offset += 1;
	buffer[offset] = (timeLow >>> 8) & 0xff;
	offset += 1;
	buffer[offset] = timeLow & 0xff;
	offset += 1;

	const timeMid = (((milis / 0x10000000) | 0) * 625 + ((timestamp / 0x100000000) | 0)) & 0xfffffff;

	buffer[offset] = (timeMid >>> 8) & 0xff;
	offset += 1;
	buffer[offset] = timeMid & 0xff;
	offset += 1;

	// `time_high_and_version`
	buffer[offset] = ((timeMid >>> 24) & 0xf) | 0x10; // include version
	offset += 1;
	buffer[offset] = (timeMid >>> 16) & 0xff;
	offset += 1;

	// `clock_seq_hi_and_reserved` | variant
	buffer[offset] = (clockSequence >>> 8) | 0x80;
	offset += 1;

	// `clock_seq_low`
	buffer[offset] = clockSequence & 0xff;
	offset += 1;

	for (let index = 0; index < 6; index += 1) {
		buffer[offset] = node[index];
		offset += 1;
	}

	const stringified = stringifyBytes(buffer);

	if (!stringified) {
		throw new UuidV1UtilError("Something went wrong generating the UUID, a malformed UUID was detected.");
	}

	return stringified;
}

export { uuidV1 as v1 };
