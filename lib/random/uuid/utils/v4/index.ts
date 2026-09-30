import { UtilError } from "~/error";
import { getRNG, stringifyBytes } from "../../helpers";
import type { UuidRNGOptions } from "../../types";

export class UuidV4UtilError extends UtilError {
	public readonly util = "uuidV4";
}

export interface UuidV4Options extends UuidRNGOptions {}

export function uuidV4(options?: UuidV4Options): string {
	// If possible and no options are given, use the build in secure UUID generation
	if (!options && crypto && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	const random = getRNG(options);

	if (!random) {
		throw new UuidV4UtilError("Random byte length must at least be 16");
	}

	// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	random[6] = (random[6] & 0x0f) | 0x40;
	random[8] = (random[8] & 0x3f) | 0x80;

	const stringified = stringifyBytes(random);

	if (!stringified) {
		throw new UuidV4UtilError("Something went wrong generating the UUID, a malformed UUID was detected.");
	}

	return stringified;
}

export { uuidV4 as v4, uuidV4 as uuid };
