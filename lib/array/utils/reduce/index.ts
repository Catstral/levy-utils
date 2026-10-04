export type ReduceCallback<T, Acc> = (accumulator: Acc, value: T, index: number, list: readonly T[]) => Acc;

export interface ReduceOptions<Acc = unknown, R = Acc> {
	/**
	 * The direction the list should be checked in..
	 *
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

/**
 * Reduces all items of a list down to an accumulated result.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @template Acc
 * @template [R=Acc]
 * @param {readonly T[]} list The array to reduce items from
 * @param {Acc} initial The initial value of the accumulator
 * @param {ReduceCallback<T, Acc>} callback A callback that passed the current item and returns a new accumulator
 * @returns {R} The accumulated result of the given list
 */
export function reduce<const T, Acc>(list: T[], initial: Acc, callback: ReduceCallback<T, Acc>): Acc;
/**
 * Reduces all items of a list down to an accumulated result.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @template Acc
 * @template [R=Acc]
 * @param {readonly T[]} list The array to reduce items from
 * @param {Acc} initial The initial value of the accumulator
 * @param {ReduceCallback<T, Acc>} callback A callback that passed the current item and returns a new accumulator
 * @param {ReduceOptions<Acc, R>} [options] Options to define how the list should be reduced (see {@link ReduceOptions} for more details)
 * @returns {R} The accumulated result of the given list
 */
export function reduce<const T, Acc, const R = Acc>(
	list: readonly T[],
	initial: Acc,
	callback: ReduceCallback<T, Acc>,
	options: ReduceOptions<Acc, R>,
): R;
export function reduce<const T, Acc, const R = Acc>(
	list: readonly T[],
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
