import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../../config";
import { UtilError } from "../../../../error";
import { getRNG, readUuidRNGConfig, stringifyBytes, UUID_RNG_CONFIG_SHAPE } from "../../helpers";
import type { UuidRNGConfig, UuidRNGOptions } from "../../types";

export class UuidV4UtilError extends UtilError {
	public readonly util = "uuidV4";
}

/**
 * @typedef {Object} UuidV4Options
 * @extends UuidRNGOptions
 */

export interface UuidV4Options extends UuidRNGOptions {}

export interface UuidV4Config extends UuidRNGConfig {}

/**
 * Returns a Cryptographically secure random V4 UUID string.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {UuidV1Options} [options] The options to decide how to generate the UUID
 * @returns {string} A V4 UUID string
 * @throws {UuidV4UtilError} If the length of the specified random bytes is less then 16
 */
export function uuidV4(options?: UuidV4Options): string {
	const rngOptions = readUuidRNGConfig(uuidV4.config);

	const finalOptions = {
		...rngOptions,
		...options,
	};

	// If possible and no options are given, use the build in secure UUID generation
	if (
		!finalOptions.rng &&
		!finalOptions.random &&
		crypto &&
		"randomUUID" in crypto &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	const random = getRNG(finalOptions);

	if (!random) {
		throw new UuidV4UtilError("Random byte length must at least be 16");
	}

	// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	random[6] = (random[6] & 0x0f) | 0x40;
	random[8] = (random[8] & 0x3f) | 0x80;

	return stringifyBytes(random);
}

uuidV4.config = createUtilConfig<UtilConfigDefinitionShape<UuidV4Config>>({
	...UUID_RNG_CONFIG_SHAPE,
});

export { uuidV4 as v4, uuidV4 as uuid };
