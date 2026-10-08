/**
 * Returns a random number between a given minimum and maximum value.
 *
 * Returns `NaN` if the minimum and maximum contradict each other.
 *
 * NOTE: this is the only random utility in this library that is **NOT** cryptographically secure.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} [min=0] The minimum random value
 * @param {number} [max=1] The maximum random value
 * @returns {number} A random number between the min and max value
 */
export function random(min: number = 0, max: number = 1): number {
	if (min > max) {
		return NaN;
	}

	if (min === max) {
		return min;
	}

	const diff = max - min;

	return Math.random() * diff + min;
}
