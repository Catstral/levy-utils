export type ReduceCallback<T, Acc> = (accumulator: Acc, value: T, index: number, list: readonly T[]) => Acc;

export function reduce<const T, Acc>(list: T[], initial: Acc, callback: ReduceCallback<T, Acc>, mapper?: never): Acc;
export function reduce<const T, Acc, const R = Acc>(
	list: T[],
	initial: Acc,
	callback: ReduceCallback<T, Acc>,
	mapper: (result: Acc) => R,
): R;
export function reduce<const T, Acc, const R = Acc>(
	list: T[],
	initial: Acc,
	callback: ReduceCallback<T, Acc>,
	mapper?: (result: Acc) => R,
): Acc | R {
	let acc: Acc = initial;

	for (const [index, value] of list.entries()) {
		acc = callback(acc, value, index, list);
	}

	if (mapper) {
		return mapper(acc);
	}

	return acc;
}
