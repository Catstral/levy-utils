export function getCryptoSecureRandomNumber(max: number, Err: new (message: string) => Error): number {
	const u8Limit = 256;
	const u16Limit = 65536;
	const u32Limit = 4294967296;

	let random: number;

	if (max < u8Limit) {
		random = crypto.getRandomValues(new Uint8Array(1))[0];
	} else if (max < u16Limit) {
		random = crypto.getRandomValues(new Uint16Array(1))[0];
	} else if (max < u32Limit) {
		random = crypto.getRandomValues(new Uint32Array(1))[0];
	} else {
		throw new Err(`Max value is too large, Max value must be less then ${u32Limit} but is ${max}`);
	}

	return random % max;
}
