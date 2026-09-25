/**
 * Clamps a number between a minimum and maximum value.
 *
 * Returns `NaN` if the minimum and maximum contradict each other.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} min The minimum value
 * @param {number} value The value to be clamped between `min` and `max`
 * @param {number} max The maximum value
 * @returns {number} The clamped number
 */
export function clamp(min: number, value: number, max: number): number {
	if (min > max) {
		return NaN;
	}

	if (min <= value && value <= max) {
		return value;
	}

	if (value < min) {
		return min;
	}

	if (value > max) {
		return max;
	}

	return NaN;
}
