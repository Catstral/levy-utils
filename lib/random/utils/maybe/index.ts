/**
 * Returns a random boolean.
 *
 * The time complexity for this is `O(1)`.
 *
 * @returns {boolean} A random boolean
 */
export function maybe(): boolean {
	const middlePoint = 127.5;

	return crypto.getRandomValues(new Uint8Array(1))[0] < middlePoint;
}
