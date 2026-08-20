import type * as utils from ".";

export abstract class UtilError extends Error {
	public abstract readonly util: Exclude<keyof typeof utils, `${string}UtilError`>;
}
