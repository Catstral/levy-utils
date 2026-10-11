/**
 * Returns a random value less then max.
 *
 * NOTE: This is meant for getting an array index as the max number here is equal to the max array length.
 */
export function getCryptoSecureRandomNumber(max: number): number {
	const u8Limit = 256;
	const u16Limit = 65536;

	let random: number;

	if (max < u8Limit) {
		random = crypto.getRandomValues(new Uint8Array(1))[0];
	} else if (max < u16Limit) {
		random = crypto.getRandomValues(new Uint16Array(1))[0];
	} else {
		// NOTE: this value is only used for arrays and arrays have a size limit of (2 ** 32) - 1 and that is the max value of a u32 int
		// Therefore this does not need to be validated.
		random = crypto.getRandomValues(new Uint32Array(1))[0];
	}

	return random % max;
}
