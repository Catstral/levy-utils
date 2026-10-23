import type { Entries } from "./object";

export type UtilConfigDefinition<T> = {
	default: () => T;
};

export type UtilConfig<S extends Record<string, unknown>> = {
	[K in keyof S]-?: S[K];
} & {
	/**
	 * Resets all config properties to their default value.
	 */
	reset(): void;
	/**
	 * A read-only object containing the default values for each config property.
	 */
	default: {
		readonly [K in Exclude<keyof S, "default" | "reset">]: S[K];
	};
};

export function createUtilConfig<const S extends Record<string, UtilConfigDefinition<unknown>>>(
	shape: S,
): UtilConfig<{
	[K in keyof S]: ReturnType<S[K]["default"]>;
}> {
	const entries = Object.entries(shape) as Entries<S>;
	const config: Record<string, unknown> = {
		...Object.fromEntries(entries.map(([key, definition]) => [key, definition.default()])),
		default: {},
		reset() {
			for (const [key, value] of Object.entries(this.default as Record<string, unknown>)) {
				this[key as string] = value;
			}
		},
	};

	for (const [key, value] of entries) {
		Object.defineProperty(config.default, key, {
			enumerable: true,
			configurable: false,
			get() {
				return value;
			},
		});
	}

	Object.freeze(config.default);

	return config as UtilConfig<{
		[K in keyof S]: ReturnType<S[K]["default"]>;
	}>;
}
