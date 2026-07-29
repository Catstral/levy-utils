import type * as utils from ".";

export abstract class UtilError extends Error {
	public abstract get util(): Exclude<keyof typeof utils, `${string}UtilError`>;
}
