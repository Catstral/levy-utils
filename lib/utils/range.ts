import { UtilError } from "..";
import { type Computable, compute } from "./compute";

export class RangeUtilError extends UtilError {
	public get util(): "range" {
		return "range";
	}
}

/**
 * @typedef {Object} RangeOptions
 * @template T
 * @prop {T | ((step: number) => T)} [valueMapper] A mapper to map the current step of the range to a given value that will be returned by the generator
 * @prop {number} [step] A number to define the steps that should be used by the range generator
 */

export interface RangeOptions<T> {
	/**
	 * A mapper to map the current step of the range to a given value that will be returned by the generator.
	 *
	 * @default undefined
	 */
	valueMapper?: Computable<T, [step: number]> | undefined;
	/**
	 * A number to define the steps that should be used by the range generator.
	 *
	 * @default 1
	 */
	step?: number;
}

/**
 * Returns a generator that returns values from a specified range.
 *
 * If `start` is greater than `end`, the range will traverse negatively (counting down) instead of positively.
 *
 * The time complexity for this is `O(n)` where `n` is the amount of steps needed to generate the result.
 *
 * @example
 * // This will log the following numbers: 0, 1, 2, 3
 * for (const value of range(3)) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: 0, 1, 2, 3
 * for (const value of range(0, 3)) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: 3, 2, 1, 0
 * for (const value of range(3, 0)) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: 0, 2, 4, 6
 * for (const value of range(0, 6, { step: 2 })) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: 6, 4, 2, 0
 * for (const value of range(6, 0, { step: -2 })) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: "foo", "foo", "foo", "foo"
 * for (const value of range(0, 3, { valueMapper: "foo" })) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: "foo-0", "foo-1", "foo-2", "foo-3"
 * for (const value of range(0, 3, { valueMapper: (currentStep) => `foo-${currentStep}` })) {
 * 	console.log(value);
 * }
 *
 * @example
 * // This will log the following: "foo-0", "foo-2", "foo-4", "foo-6"
 * for (const value of range(0, 6, { step: 2, valueMapper: (currentStep) => `foo-${currentStep}` })) {
 * 	console.log(value);
 * }
 *
 * @template [T=number]
 * @param {number} startOrLength The start of the range, or if this is the only parameter given, the length of the range (inclusive)
 * @param {number | undefined} [end] The end of the range (inclusive), if this value is not given, the `startOrLength` will be used to determine the end
 * @param {RangeOptions<T>} options The options used to generate the range (see {@link RangeOptions} for more details)
 * @returns {Generator<T>} A generator of a specified range (optionally mapped to a specified value)
 * @throws {RangeUtilError} If `options.step` is `0`
 * @throws {RangeUtilError} If `options.step` is positive while the range traverses negatively (`start` > `end`), or negative while the range traverses positively
 */
export function* range<const T = number>(startOrLength: number, end?: number, options?: RangeOptions<T>): Generator<T> {
	let value = typeof end === "number" ? startOrLength : 0;
	const endValue = typeof end === "number" ? end : startOrLength;
	const shouldStepDown = value > endValue;

	if (options) {
		if (typeof options.step === "number") {
			if (options.step === 0) {
				throw new RangeUtilError("Step cannot be 0, that would cause the range to become infinite");
			}

			if (shouldStepDown && options.step > 0) {
				throw new RangeUtilError(
					"Given start and end should cause the range to traverse negatively, but step is specified to traverse positively",
				);
			} else if (!shouldStepDown && options.step < 0) {
				throw new RangeUtilError(
					"Given start and end should cause the range to traverse positively, but step is specified to traverse negatively",
				);
			}
		}
	}

	while (shouldStepDown ? value >= endValue : value <= endValue) {
		if (options?.valueMapper !== undefined) {
			yield compute(options.valueMapper, value);
		} else {
			yield value as T;
		}

		value += options?.step ?? (shouldStepDown ? -1 : 1);
	}
}
