/**
 * Returns a max UUID string that is all 'f' (or ones in bit form).
 *
 * The time complexity for this is `O(1)`.
 *
 * @returns {string} The max UUID string
 */
export function uuidMax(): string {
	return "ffffffff-ffff-ffff-ffff-ffffffffffff";
}
