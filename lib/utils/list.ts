import { UtilError } from "..";
import { type Computable, compute } from "./compute";

export class ListUtilError extends UtilError {
	public get util(): "list" {
		return "list";
	}
}

/**
 * @typedef {Object} ListOptions
 * @template T
 * @prop {T | ((step: number) => T)} [valueMapper] A mapper to map the current step of the list to a given value
 * @prop {number} [step] A number to define the steps that should be used by the list
 */

export interface ListOptions<T> {
	/**
	 * A mapper to map the current step of the list to a given value.
	 *
	 * @default undefined
	 */
	valueMapper?: Computable<T, [step: number]> | undefined;
	/**
	 * A number to define the steps that should be used by the list.
	 *
	 * @default 1
	 */
	step?: number;
}

/**
 * Returns an array of values from a specified range.
 *
 * If `start` is greater than `end`, the list will traverse negatively (counting down) instead of positively.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of steps needed to construct the result.
 *
 * @example
 * const arr = list(3); // -> [0, 1, 2, 3]
 *
 * @example
 * const arr = list(0, 3); // -> [0, 1, 2, 3]
 *
 * @example
 * const arr = list(3, 0) // -> [3, 2, 1, 0]
 *
 * @example
 * const arr = list(0, 6, { step: 2 }); // -> [0, 2, 4, 6]
 *
 * @example
 * const arr = list(6, 0, { step: -2 }) // -> [6, 4, 2, 0]
 *
 * @example
 * const arr = list(0, 3, { valueMapper: "foo" }) // -> ["foo", "foo", "foo", "foo"]
 *
 * @example
 * const arr = list(0, 3, { valueMapper: (currentStep) => `foo-${currentStep}` }) // -> ["foo-0", "foo-1", "foo-2", "foo-3"]
 *
 * @example
 * const arr = list(0, 6, { step: 2, valueMapper: (currentStep) => `foo-${currentStep}` }) // -> ["foo-0", "foo-2", "foo-4", "foo-6"]
 *
 * @template [T=number]
 * @param {number} startOrLength The start of the list, or if this is the only parameter given, the length of the list (inclusive)
 * @param {number | undefined} [end] The end of the list (inclusive), if this value is not given, the `startOrLength` will be used to determine the end
 * @param {ListOptions<T>} [options] The options used to generate the list (see {@link ListOptions} for more details)
 * @returns {T[]} A list of a specified size (optionally mapped to a specified value)
 * @throws {ListUtilError} If `options.step` is `0`
 * @throws {ListUtilError} If `options.step` is positive while the list traverses negatively (`start` > `end`), or negative while the list traverses positively
 */
export function list<const T = number>(startOrLength: number, end?: number, options?: ListOptions<T>): T[] {
	let value = typeof end === "number" ? startOrLength : 0;
	const endValue = typeof end === "number" ? end : startOrLength;
	const shouldStepDown = value > endValue;

	if (options) {
		if (typeof options.step === "number") {
			if (options.step === 0) {
				throw new ListUtilError("Step cannot be 0, that would cause the list to become infinite");
			}

			if (shouldStepDown && options.step > 0) {
				throw new ListUtilError(
					"Given start and end should cause the list to traverse negatively, but step is specified to traverse positively",
				);
			} else if (!shouldStepDown && options.step < 0) {
				throw new ListUtilError(
					"Given start and end should cause the list to traverse positively, but step is specified to traverse negatively",
				);
			}
		}
	}

	const list: T[] = [];

	while (shouldStepDown ? value >= endValue : value <= endValue) {
		if (options?.valueMapper !== undefined) {
			list.push(compute(options.valueMapper, value));
		} else {
			list.push(value as T);
		}

		value += options?.step ?? (shouldStepDown ? -1 : 1);
	}

	return list;
}
