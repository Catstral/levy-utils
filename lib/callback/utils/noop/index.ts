import { createUtilConfig } from "../../../config";

export interface NoopUtilConfig {
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

noop.config = createUtilConfig<NoopUtilConfig>({});
