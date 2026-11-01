import { createUtilConfig } from "../../../config";

export interface IsNullUtilConfig {
	[key: string]: never;
}

/**
 * Checks if the given value is null.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} value The value to check if it is null
 * @returns {boolean} A boolean that signals if the given value is null
 */
export function isNull(value: unknown): value is null {
	return value === null;
}

isNull.config = createUtilConfig<IsNullUtilConfig>({});
