/**
 * Checks if the given value is a prime number.
 *
 * The time complexity for this is `O(√n)` where `n` is the given number.
 *
 * @param {number} value The value to check if it is a prime number
 * @returns {boolean} A boolean that signals if the given number is a prime number
 */
export function isPrime(value: number): boolean {
	if (!Number.isInteger(value) || value <= 1 || (value > 2 && value % 2 === 0)) {
		return false;
	}

	const square = Math.sqrt(value);

	for (let index = 3; index <= square; index += 2) {
		if (value % index === 0) {
			return false;
		}
	}

	return true;
}
