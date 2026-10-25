import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface NoopConfig {
	[key: string]: never;
}

/**
 * No operation, this function does nothing.
 *
 * The time complexity for this is `O(1)`.
 *
 * @returns {void}
 */
export function noop(): void {}

noop.config = createUtilConfig<UtilConfigDefinitionShape<NoopConfig>>({});
