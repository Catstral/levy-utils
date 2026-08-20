import type { Key } from "~/types";

/**
 * @typedef {Object} ToggleOptions
 * @template T
 * @prop {(item: T) => Key} [tokey] A function to turn an item into a key to determine if the value should be toggled
 * @prop {"APPEND" | "PREPEND"} [strategy="APPEND"] The strategy to use when toggling a value
 */

export interface ToggleOptions<T> {
	/**
	 * A function to turn an item into a key to determine if the value should be toggled.
	 *
	 * @param {T} item The item to turn into a key
	 * @returns {Key} A key to identify the item by
	 * @default undefined
	 */
	toKey?: (item: T) => Key;
	/**
	 * The strategy to use when toggling a value.
	 * @default "APPEND"
	 */
	strategy?: "APPEND" | "PREPEND";
}

/**
 * Toggles a value from an array and returns the new array with the value either removed or added.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of items in the list.
 *
 * @template T
 * @param {T[]} list The list to toggle the item from
 * @param {T} itemToToggle The item to toggle from the list
 * @param {ToggleOptions<T>} [options] Options to define how the item should be toggled (see {@link ToggleOptions} for more details)
 * @returns {T[]} A new list with the specified item toggled
 */
export function toggle<const T>(list: T[], itemToToggle: T, options?: ToggleOptions<T>): T[] {
	const toKey = (item: T) => {
		return options?.toKey?.(item) ?? item;
	};

	const index = list.findIndex((item) => toKey(item) === toKey(itemToToggle));

	const currentList = [...list];

	if (index === -1) {
		const strategy = options?.strategy ?? "APPEND";

		switch (strategy) {
			case "APPEND": {
				currentList.push(itemToToggle);

				break;
			}
			case "PREPEND": {
				currentList.unshift(itemToToggle);

				break;
			}
		}
	} else {
		currentList.splice(index, 1);
	}

	return currentList;
}
