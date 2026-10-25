import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface KeysConfig {
	[key: string]: never;
}

/**
 * Converts an object into a types version of `Object.keys`.
 */
export function keys<const T extends Record<string, unknown>>(value: T): (keyof T)[] {
	return Object.keys(value);
}

keys.config = createUtilConfig<UtilConfigDefinitionShape<KeysConfig>>({});
