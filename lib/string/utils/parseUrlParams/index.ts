// TODO: Write docs

import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface ParseUrlParamsConfig {
	[key: string]: never;
}

export function parseUrlParams(url: string): Record<string, string | undefined>;
export function parseUrlParams<const T extends Record<string, (value: string | undefined) => unknown>>(
	url: string,
	transform: T,
): { [K in keyof T]: ReturnType<T[K]> };
export function parseUrlParams<const T extends Record<string, (value: string | undefined) => unknown>>(
	url: string,
	transform?: T,
): Record<string, string> | T {
	const parser = new URL(url);
	const obj = Object.fromEntries(parser.searchParams.entries());

	if (transform) {
		const result: Record<string, unknown> = {};

		for (const key in transform) {
			result[key] = transform[key](obj[key]);
		}

		return result as T;
	}

	return obj;
}

parseUrlParams.config = createUtilConfig<UtilConfigDefinitionShape<ParseUrlParamsConfig>>({});
