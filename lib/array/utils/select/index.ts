import { UtilError } from "~/error";

/**
 * @private
 */
interface SelectDiscardAction {
	type: "DISCARD";
}

/**
 * @private
 */
interface SelectKeepAction {
	type: "KEEP";
}

/**
 * @private
 */
interface SelectFilterAction {
	type: "FILTER";
	keep: boolean;
}

/**
 * @private
 */
interface SelectMapAction<R> {
	type: "MAP";
	value: R;
}

/**
 * @private
 */
interface SelectFlatAction<R> {
	type: "FLAT";
	values: R[];
}

/**
 * @private
 */
interface SelectSpreadAction<R> {
	type: "SPREAD";
	values: R[];
}

/**
 * @private
 */
type SelectAction<R> =
	| SelectDiscardAction
	| SelectKeepAction
	| SelectFilterAction
	| SelectMapAction<R>
	| SelectSpreadAction<R>
	| SelectFlatAction<R>;

/**
 * @private
 */
interface SelectContext<T, R = T> {
	item: T;
	index: number;
	list: readonly T[];
	/**
	 * Discards the current item from the resulting list.
	 *
	 * @returns {SelectDiscardAction} An action that discards the current item.
	 */
	discard(): SelectDiscardAction;
	/**
	 * Keeps the current item in the resulting list.
	 *
	 * @returns {SelectKeepAction} An action that keeps the current item.
	 */
	keep(): SelectKeepAction;
	/**
	 * Filters the current item in the resulting list based on the given boolean.
	 *
	 * @param {boolean} keep Whether the current item should be kept
	 * @returns {SelectFilterAction} An action that keeps or discards the current item.
	 */
	filter(keep: boolean): SelectFilterAction;
	/**
	 * Maps the current item to the given value in the resulting list.
	 *
	 * @param {R} value The value to add in place of the current item
	 * @returns {SelectMapAction<R>} An action that maps the current item to the given value
	 */
	map(value: R): SelectMapAction<R>;
	/**
	 * Flats every item of the given list into the resulting list in place of the current item.
	 *
	 * @param {R[]} values The values to add in place of the current item
	 * @returns {SelectFlatAction<R>} An action that flattens the given values into the resulting list
	 */
	flat(values: R[]): SelectFlatAction<R>;
	/**
	 * Spreads every given item into the resulting list in place of the current item.
	 *
	 * @param {...R[]} values The values to add in place of the current item
	 * @returns {SelectSpreadAction<R>} An action that spreads the given values into the resulting list
	 */
	spread(...values: R[]): SelectSpreadAction<R>;
}

export class SelectUtilError extends UtilError {
	public readonly util = "select";
}

/**
 * Returns a new list built by deciding what should end up in the result per item.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @example
 * select(
 *     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
 *     ({ item, keep, discard, filter }) => {
 *         // Keep all numbers less than 3
 *         if (item < 3) {
 *             return keep();
 *         }
 *
 * 		   // Removes all numbers greater than 8
 *         if (item > 8) {
 *             return discard();
 *         }
 *
 *         // Filters all even numbers
 *         return filter(item % 2 === 0);
 *     },
 * );
 *
 * @example
 * select<number | string[] | null, string>(
 *     [1, ["2", "3", "4"], null, ["7", "8", "9"], 10],
 *     ({ item, map, flat, spread }) => {
 *         if (typeof item === "number") {
 *             return map(item.toString());
 *         }
 *
 *         if (Array.isArray(item)) {
 *              return flat(item);
 *         }
 *
 *         return spread("5", "6");
 *     },
 * );
 *
 * @template T
 * @template [R=T]
 * @param {readonly T[]} list The list to select items from
 * @param {(context: SelectContext<T, R>) => SelectAction<R>} callback A callback that returns an action describing what to do with the current item
 * @returns {R[]} A new list with all kept, mapped and flattened values
 * @throws {SelectUtilError} If the callback returns an invalid action
 */
export function select<T, R = T>(
	list: readonly T[],
	callback: (
		context: [R] extends [T] ? SelectContext<T, R> : Omit<SelectContext<T, R>, "keep" | "filter">,
	) => Exclude<SelectAction<R>, { type: [R] extends [T] ? never : "KEEP" | "FILTER" }>,
): R[] {
	if (list.length === 0) {
		return [];
	}

	const result: unknown[] = [];
	const context = {
		list,
		discard() {
			return {
				type: "DISCARD",
			};
		},
		keep() {
			return {
				type: "KEEP",
			};
		},
		filter(keep) {
			return {
				type: "FILTER",
				keep,
			};
		},
		map(value) {
			return {
				type: "MAP",
				value,
			};
		},
		flat(values) {
			return {
				type: "FLAT",
				values,
			};
		},
		spread(...values) {
			return {
				type: "SPREAD",
				values,
			};
		},
	} satisfies Partial<SelectContext<T, R>>;

	for (const [index, item] of list.entries()) {
		const action = callback({
			...context,
			index,
			item,
		} as SelectContext<T, R>);

		switch (action.type) {
			case "DISCARD": {
				break;
			}
			case "KEEP": {
				result.push(item);

				break;
			}
			case "FILTER": {
				if (action.keep) {
					result.push(item);
				}

				break;
			}
			case "MAP": {
				result.push(action.value);

				break;
			}
			case "SPREAD":
			case "FLAT": {
				result.push(...action.values);

				break;
			}
			default: {
				const type = (action as { type: unknown }).type;

				throw new SelectUtilError(`Invalid action type: ${type}`);
			}
		}
	}

	return result as R[];
}
