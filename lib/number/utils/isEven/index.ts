/**
 * Checks if the given value is an even number.
 *
 * @param value The value to check if it is an even number
 * @returns A boolean that signals if the given number is even
 */
export function isEven(value: number): boolean {
	return ((value % 2) + 2) % 2 === 0;
}
