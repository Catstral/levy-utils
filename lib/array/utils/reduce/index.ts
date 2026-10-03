export type ReduceCallback<T, Acc> = (accumulator: Acc, value: T, index: number, list: readonly T[]) => Acc;

export interface ReduceOptions<Acc = unknown, R = Acc> {
	/**
	 * @default "ASCENDING"
	 */
	direction?: "ASCENDING" | "DESCENDING";
	/**
	 * Transforms the accumulator into a final result.
	 *
	 * @param accumulator
	 * @returns {R}
	 */
	result?: (accumulator: Acc) => R;
}

export function reduce<const T, Acc>(list: T[], initial: Acc, callback: ReduceCallback<T, Acc>): Acc;
export function reduce<const T, Acc, const R = Acc>(
	list: T[],
	initial: Acc,
	callback: ReduceCallback<T, Acc>,
	options: ReduceOptions<Acc, R>,
): R;
export function reduce<const T, Acc, const R = Acc>(
	list: T[],
	initial: Acc,
	callback: ReduceCallback<T, Acc>,
	options?: ReduceOptions<Acc, R>,
): Acc | R {
	const direction = options?.direction ?? "ASCENDING";

	let acc: Acc = initial;

	if (direction === "DESCENDING") {
		for (let index = list.length - 1; index !== -1; index--) {
			acc = callback(acc, list[index], index, list);
		}
	} else {
		for (const [index, value] of list.entries()) {
			acc = callback(acc, value, index, list);
		}
	}

	if (options?.result) {
		return options.result(acc);
	}

	return acc;
}
