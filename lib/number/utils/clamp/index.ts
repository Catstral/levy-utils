export function clamp(value: number, start: number, end: number) {
	const min = Math.min(start, end);
	const max = Math.max(start, end);

	return Math.max(min, Math.min(value, max));
}
