import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../../config";

export interface UuidNilConfig {
	[key: string]: never;
}

/**
 * Returns a nil UUID string that is all zero's.
 *
 * The time complexity for this is `O(1)`.
 *
 * @returns {string} The nil UUID string
 */
export function uuidNil(): string {
	return "00000000-0000-0000-0000-000000000000";
}

uuidNil.config = createUtilConfig<UtilConfigDefinitionShape<UuidNilConfig>>({});
