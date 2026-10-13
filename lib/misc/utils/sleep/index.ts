/**
 * Returns a promise that will resolve after the specified delay has elapsed.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {number} delayMs The delay to wait to resolve the returned promise
 * @returns {Promise<void>} A Promise that resolved after the specified delay has elapsed
 */
export async function sleep(delayMs: number): Promise<void> {
	return new Promise((resolve) => {
		const finalDelay = Math.max(delayMs, 0);

		setTimeout(resolve, finalDelay);
	});
}
