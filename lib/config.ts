import type { Entries } from "./object";
import type { AnyRecord } from "./types";

export type UtilConfigDefinition<T = unknown> = {
	default: () => T;
};

export type UtilConfig<S extends AnyRecord> = {
	-readonly [K in keyof S]-?: S[K];
} & {
	/**
	 * Resets all config properties to their default value.
	 */
	reset(): void;
	/**
	 * A read-only object containing the default values for each config property.
	 */
	default: {
		readonly [K in keyof S]-?: S[K];
	};
};

export type UtilConfigShape<S extends AnyRecord> = {
	[K in keyof S]: UtilConfigDefinition<S[K]>;
};

export function createUtilConfig<const T extends AnyRecord>(shape: UtilConfigShape<T>): UtilConfig<T> {
	const entries = Object.entries(shape) as Entries<UtilConfigShape<T>>;
	const config: AnyRecord = {
		...Object.fromEntries(entries.map(([key, definition]) => [key, definition.default()])),
		default: {},
		reset() {
			for (const [key, value] of Object.entries(this.default)) {
				this[key] = value;
			}
		},
	};

	for (const [key, value] of entries) {
		const defaultValue = value.default();

		Object.defineProperty(config.default, key, {
			enumerable: true,
			configurable: false,
			get() {
				return defaultValue;
			},
		});
	}

	Object.freeze(config.default);

	return config as UtilConfig<T>;
}
