/**
 * Returns a boolean based on the given chance percentage.
 *
 * The percentage specified should be on a scale of 0 - 1, meaning if you want a 50% chance
 * the percentage should be specified to be 0.5.
 *
 * If the percentage is more than or equal to 1, tthe returned value will always be true.
 * If the percentage is less than or equal to 0, the returned value will always be false.
 *
 * @param {number} percentage The percentage chance it has of being true (scale: 0 - 1)
 * @returns {boolean} The random boolean based on the specified chance
 */
export function chance(percentage: number): boolean {
	if (percentage >= 1) {
		return true;
	}

	if (percentage <= 0) {
		return false;
	}

	const fullPercentage = 255;

	return crypto.getRandomValues(new Uint8Array(1))[0] < fullPercentage * percentage;
}
