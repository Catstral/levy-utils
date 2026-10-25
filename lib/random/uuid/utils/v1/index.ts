import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../../config";
import { UtilError } from "../../../../error";
import { getRNG, readUuidRNGConfig, stringifyBytes, UUID_RNG_CONFIG_SHAPE } from "../../helpers";
import type { UuidRNGConfig, UuidRNGOptions } from "../../types";

export class UuidV1UtilError extends UtilError {
	public readonly util = "uuidV1";
}

/**
 * @typedef {Object} UuidV1Options
 * @extends UuidRNGOptions
 * @prop {number} [milliseconds=Date.now()] The amount of milliseconds that have past since the EPOCH (01-01-1970)
 * @prop {number} [nanoseconds=0] The amount of nanoseconds that have elapsed in the current millisecond
 * @prop {number} [clockSequence] The clock sequence used for generation
 * @prop {Uint8Array} [node] A list of random bytes used to complete the UUID
 */

export interface UuidV1Options extends UuidRNGOptions {
	/**
	 * The amount of milliseconds that have past since the EPOCH (01-01-1970).
	 *
	 * @default `Date.now()`
	 */
	milliseconds?: number;
	/**
	 * The amount of nanoseconds that have elapsed in the current millisecond.
	 *
	 * @default `0`
	 */
	nanoseconds?: number;
	/**
	 * The clock sequence used for generation.
	 */
	clockSequence?: number;
	/**
	 * A list of random bytes used to complete the UUID.
	 */
	node?: Uint8Array;
}

export interface UuidV1Config extends UuidRNGConfig {
	milliseconds: number | undefined;
	nanoseconds: number | undefined;
	clockSequence: number | undefined;
	node: Uint8Array | undefined;
}

/**
 * Returns a Cryptographically secure random V1 UUID string.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {UuidV1Options} [options] The options to decide how to generate the UUID
 * @returns {string} A V1 UUID string
 * @throws {UuidV1UtilError} If the length of the specified random bytes is less then 16
 */
export function uuidV1(options?: UuidV1Options): string {
	const rngOptions = readUuidRNGConfig(uuidV1.config);
	const random = getRNG({
		...rngOptions,
		...options,
	});

	if (!random) {
		throw new UuidV1UtilError("Random byte length must at least be 16");
	}

	// NOTE: the milis and nanos split is because it requires 57+ bit numbers, but JS doesn't offer that precision.
	// Offset to Gregorian epoch
	// https://www.rfc-editor.org/rfc/rfc9562.html#section-5.1-1
	const milis = (options?.milliseconds ?? uuidV1.config.milliseconds ?? Date.now()) + 12219292800000;
	const nanos = options?.nanoseconds ?? uuidV1.config.nanoseconds ?? 0;
	const clockSequence =
		options?.clockSequence ?? uuidV1.config.clockSequence ?? ((random[8] << 8) | random[9]) & 0x3fff;
	const buffer = new Uint8Array(16);
	const node = options?.node ?? uuidV1.config.node ?? random.slice(10, 16);

	if (!options?.node && !uuidV1.config.node) {
		// Set multicast bit
		// https://www.rfc-editor.org/rfc/rfc9562.html#section-6.10-3
		node[0] |= 0x01;
	}

	const timestamp = (milis & 0xfffffff) * 10000 + nanos;
	const timeLow = timestamp >>> 0;

	buffer[0] = (timeLow >>> 24) & 0xff;
	buffer[1] = (timeLow >>> 16) & 0xff;
	buffer[2] = (timeLow >>> 8) & 0xff;
	buffer[3] = timeLow & 0xff;

	const timeMid = (((milis / 0x10000000) | 0) * 625 + ((timestamp / 0x100000000) | 0)) & 0xfffffff;

	buffer[4] = (timeMid >>> 8) & 0xff;
	buffer[5] = timeMid & 0xff;

	// `time_high_and_version`
	buffer[6] = ((timeMid >>> 24) & 0xf) | 0x10; // include version
	buffer[7] = (timeMid >>> 16) & 0xff;

	// `clock_seq_hi_and_reserved` | variant
	buffer[8] = (clockSequence >>> 8) | 0x80;

	// `clock_seq_low`
	buffer[9] = clockSequence & 0xff;

	for (let index = 0; index < 6; index += 1) {
		buffer[10 + index] = node[index];
	}

	return stringifyBytes(buffer);
}

uuidV1.config = createUtilConfig<UtilConfigDefinitionShape<UuidV1Config>>({
	...UUID_RNG_CONFIG_SHAPE,
	milliseconds: {
		default: () => undefined,
	},
	nanoseconds: {
		default: () => undefined,
	},
	clockSequence: {
		default: () => undefined,
	},
	node: {
		default: () => undefined,
	},
});

export { uuidV1 as v1 };
