import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface DeferConfig {
	[key: string]: never;
}

/**
 * This will defer a callback to the next execution cycle.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {Function} callback The callback to defer to the next execution cycle
 * @returns {void}
 */
export function defer(callback: () => void): void {
	setTimeout(() => {
		callback();
	}, 0);
}

defer.config = createUtilConfig<UtilConfigDefinitionShape<DeferConfig>>({});
