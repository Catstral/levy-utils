import type { UuidRNGOptions } from "./types";

export function rng(): Uint8Array {
	const random = new Uint8Array(16);

	// NOTE: Per the UUID spec, the random value should be cryptographically safe
	// https://www.rfc-editor.org/rfc/rfc9562.html#name-unguessability
	return crypto.getRandomValues(random);
}

export function getRNG(options?: UuidRNGOptions): Uint8Array | null {
	const random = options?.random ?? options?.rng?.() ?? rng();

	if (random.length < 16) {
		return null;
	}

	return random;
}

export function validateUuid(uuid: string): boolean {
	const validUuidRegex =
		/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

	return validUuidRegex.test(uuid);
}

export function stringifyBytes(bytes: Uint8Array): string | null {
	const byteToHex: string[] = [];

	for (let i = 0; i < 256; ++i) {
		byteToHex.push((i + 0x100).toString(16).slice(1));
	}

	// NOTE: this is written like this for performance
	const stringified = (
		byteToHex[bytes[0]] +
		byteToHex[bytes[1]] +
		byteToHex[bytes[2]] +
		byteToHex[bytes[3]] +
		"-" +
		byteToHex[bytes[4]] +
		byteToHex[bytes[5]] +
		"-" +
		byteToHex[bytes[6]] +
		byteToHex[bytes[7]] +
		"-" +
		byteToHex[bytes[8]] +
		byteToHex[bytes[9]] +
		"-" +
		byteToHex[bytes[10]] +
		byteToHex[bytes[11]] +
		byteToHex[bytes[12]] +
		byteToHex[bytes[13]] +
		byteToHex[bytes[14]] +
		byteToHex[bytes[15]]
	).toLowerCase();

	// Make that given even given unique RNG gen, this will still generate a valid uuid string
	if (!validateUuid(stringified)) {
		return null;
	}

	return stringified;
}
