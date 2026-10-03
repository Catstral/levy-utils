export function hasItems<const T>(list: T[]): list is [T, ...T[]] {
	return list.length > 0;
}
