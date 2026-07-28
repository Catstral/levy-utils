import type { UtilErrorCode } from "./types";

export class UtilError extends Error {
	public readonly util: UtilErrorCode;

	public constructor(util: UtilErrorCode, message: string, options?: ErrorOptions) {
		super(message, options);

		this.util = util;
	}
}
