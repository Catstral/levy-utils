import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface IsObjectConfig {
	[key: string]: never;
}

/**
 * Checks if the given item is an object (This does not include arrays).
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {?} item - The item to check
 * @returns {boolean} A boolean to signal if the given item is an object
 */
export function isObject(item: unknown): item is object {
	return typeof item === "object" && !!item && !Array.isArray(item);
}

isObject.config = createUtilConfig<UtilConfigDefinitionShape<IsObjectConfig>>({});
