/**
 * Returns a cryptographically secure random string of characters, based on a given charset, grown to a specified length.
 *
 * The time complexity for this is `O(n log8(m))` where:
 * - `n` is the length of the uid.
 * - `m` is the length of the charset.
 *
 * @param {number} [length=8] The length of de uid
 * @param {string} [charset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"] The characters used for generation
 * @returns {string} A random string of characters from the charset, with the specified length
 */
export function uid(
	length: number = 8,
	charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
): string {
	if (charset.length === 0) {
		throw new Error();
	}

	const charLength = charset.length;
	const byteFactor = Math.max(Math.floor(Math.log(charLength) / Math.log(8)), 1);
	const bytes = crypto.getRandomValues(new Uint8Array(length * byteFactor));

	let output = "";
	let offset = 0;

	for (let index = 0; index < length; index += 1) {
		let charLocation = 0;
		const end = offset + byteFactor;

		while (offset < end) {
			charLocation += bytes[offset];
			offset += 1;
		}

		charLocation %= charLength;

		output += charset[charLocation];
	}

	return output;
}
