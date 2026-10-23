import { UtilError } from "~/error";
import type { AnyRecord } from "~/types";

export class GetUtilError extends UtilError {
	public readonly util = "get";
}

export type GetOptions<F> =
	| {
			/**
			 * Whether the function should run in strict mode.
			 *
			 * Throwing a {@link GetUtilError} when a given path doesn't exist.
			 *
			 * @default true
			 */
			strict?: true;
			/**
			 * The value to default to when getting a value fails.
			 *
			 * The fallback only works if `strict` is false.
			 */
			fallback?: never;
	  }
	| {
			/**
			 * Whether the function should run in strict mode.
			 *
			 * Throwing a {@link GetUtilError} when a given path doesn't exist.
			 *
			 * @default true
			 */
			strict: false;
			/**
			 * The value to default to when getting a value fails.
			 *
			 * The fallback only works if `strict` is false.
			 */
			fallback?: F;
	  };

export function get(object: AnyRecord, path: string | number, options?: GetOptions<unknown>): unknown {
	const strict = options?.strict ?? true;
	const fallback = options?.fallback;
	const keyPath = path.toString().split(".");

	if (strict) {
		return keyPath.reduce<{
			value: unknown;
			path: string;
		}>(
			(acc, key) => {
				if (!acc.value || typeof acc.value !== "object") {
					throw new GetUtilError(
						acc.path
							? `Invalid key path, value at '${acc.path}' is not an object`
							: "Invalid key path, value is not an object",
					);
				}

				if (!(key in acc.value)) {
					throw new GetUtilError(
						acc.path
							? `Invalid key path, '${acc.path}.${key}' does not exist on value`
							: `Invalid key path, '${key}' does not exist on value`,
					);
				}

				acc.path += acc.path ? `.${key}` : key;
				acc.value = (acc.value as AnyRecord)[key];

				return acc;
			},
			{
				value: object,
				path: "",
			},
		).value;
	}

	let failed = false;

	return keyPath.reduce<unknown>((acc, key) => {
		if (failed) {
			return fallback;
		}

		if (!acc || typeof acc !== "object") {
			failed = true;

			return fallback;
		}

		if (!(key in acc)) {
			failed = true;

			return fallback;
		}

		return (acc as AnyRecord)[key];
	}, object);
}
