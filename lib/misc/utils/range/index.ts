import { UtilError } from "~/error";
import { type Computable, compute } from "~/misc/utils/compute";

export class RangeUtilError extends UtilError {
	public readonly util = "range";
}

export type RangeString = ".." | `${number}..` | `${number | ""}..${"=" | ""}${number}` | `${number}..${number | ""}`;

export interface RangeDetails<T> {
	start?: number;
	end?: number;
	step?: number;
	mapper?: Computable<T, [step: number]> | undefined;
}

export class Range<const T = number> {
	static #rangeRegex = /^(\d+?(?:\.\d+)?)?\.\.(=)?(\d+?(?:\.\d+)?)?$/;

	static from<const T>(range: Range<T>): Range<T> {
		return new Range({
			start: range.#start,
			end: range.#end,
			step: range.#step,
			mapper: range.#mapper,
		});
	}

	#start: number | undefined;
	#end: number | undefined;
	#step: number | undefined;
	#mapper: Computable<T, [step: number]> | undefined;

	public constructor(details: RangeString);
	public constructor(details: RangeDetails<T>);
	public constructor(details: RangeDetails<T> | RangeString);
	public constructor(details: RangeDetails<T> | RangeString) {
		if (typeof details === "string") {
			const match = details.match(Range.#rangeRegex);

			if (match) {
				const start = match[1] ? Number.parseFloat(match[1]) : null;
				const inclusiveEnd = !!match[2];
				const end = match[3] ? Number.parseFloat(match[3]) : null;

				if (typeof start === "number") {
					this.#start = start;
				}

				if (typeof end === "number") {
					this.#end = inclusiveEnd ? end : end - 1;
				}
			} else {
				throw new RangeUtilError("Got a range string, but given range string is not valid");
			}
		} else {
			this.#start = details.start;
			this.#end = details.end;
			this.#step = details.step;
			this.#mapper = details.mapper;
		}
	}

	public start(start: number): Range<T> {
		return new Range<T>({
			start,
			end: this.#end,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	public end(end: number): Range<T> {
		return new Range<T>({
			start: this.#start,
			end,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	public step(step: number): Range<T> {
		return new Range<T>({
			start: this.#start,
			end: this.#end,
			step,
			mapper: this.#mapper,
		});
	}

	public map<const M>(mapper: Computable<M, [step: number]>): Range<M> {
		return new Range<M>({
			start: this.#start,
			end: this.#end,
			step: this.#step,
			mapper,
		});
	}

	public isOn(value: number): boolean {
		return value === this.#start || value === this.#end;
	}

	public isBetween(value: number): boolean {
		const isIncremental =
			typeof this.#start === "number" && typeof this.#end === "number" ? this.#start > this.#end : true;
		const currentStart = isIncremental ? this.#start : this.#end;
		const currentEnd = isIncremental ? this.#end : this.#start;

		if (typeof currentStart === "number" && typeof currentEnd === "number") {
			return value > currentStart && value < currentEnd;
		}

		if (typeof currentStart === "number") {
			return value > currentStart;
		}

		if (typeof currentEnd === "number") {
			return value < currentEnd;
		}

		return true;
	}

	public isBetweenOrOn(value: number): boolean {
		return this.isBetween(value) || this.isOn(value);
	}

	public isOutside(value: number): boolean {
		const isIncremental =
			typeof this.#start === "number" && typeof this.#end === "number" ? this.#start > this.#end : true;
		const currentStart = isIncremental ? this.#start : this.#end;
		const currentEnd = isIncremental ? this.#end : this.#start;

		if (typeof currentStart === "number" && typeof currentEnd === "number") {
			return value < currentStart || value > currentEnd;
		}

		if (typeof currentStart === "number") {
			return value < currentStart;
		}

		if (typeof currentEnd === "number") {
			return value > currentEnd;
		}

		return false;
	}

	public isOutsideOrOn(value: number): boolean {
		return this.isOutside(value) || this.isOn(value);
	}

	*[Symbol.iterator](): Generator<T> {
		if (typeof this.#start !== "number") {
			throw new RangeUtilError(
				"A range must have a start value defined before it becomes iterable, if it isn't defined it can only be used for checking values",
			);
		}

		if (typeof this.#end !== "number") {
			throw new RangeUtilError(
				"A range must have a end value defined before it becomes iterable, if it isn't defined it can only be used for checking values",
			);
		}

		let value = this.#start;
		const endValue = this.#end;
		const shouldStepDown = value > endValue;

		if (typeof this.#step === "number") {
			if (this.#step === 0) {
				throw new RangeUtilError("Step cannot be 0, that would cause the range to become infinite");
			}

			if (shouldStepDown && this.#step > 0) {
				throw new RangeUtilError(
					"Given start and end should cause the range to traverse negatively, but step is specified to traverse positively",
				);
			} else if (!shouldStepDown && this.#step < 0) {
				throw new RangeUtilError(
					"Given start and end should cause the range to traverse positively, but step is specified to traverse negatively",
				);
			}
		}

		const finalStep = this.#step ?? (shouldStepDown ? -1 : 1);

		while (shouldStepDown ? value >= endValue : value <= endValue) {
			if (this.#mapper !== undefined) {
				yield compute(this.#mapper, value);
			} else {
				yield value as T;
			}

			value += finalStep;
		}
	}

	public toArray(): T[] {
		return Array.from(this);
	}

	public clone(): Range<T> {
		return Range.from(this);
	}
}

/**
 * @typedef {Object} RangeOptions
 * @template T
 * @prop {T | ((step: number) => T)} [valueMapper] A mapper to map the current step of the range to a given value that will be returned by the Range
 * @prop {number} [step] A number to define the steps that should be used by the Range
 */

export interface RangeOptions<T> {
	/**
	 * A mapper to map the current step of the range to a given value that will be returned by the Range.
	 *
	 * @default undefined
	 */
	valueMapper?: Computable<T, [step: number]> | undefined;
	/**
	 * A number to define the steps that should be used by the Range.
	 *
	 * @default 1
	 */
	step?: number;
}

/**
 * Returns a Range that returns values from a specified range.
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
 * @param {RangeOptions<T>} [options] The options used to generate the range (see {@link RangeOptions} for more details)
 * @returns {Range<T>} A Range of a specified range (optionally mapped to a specified value)
 * @throws {RangeUtilError} If `options.step` is `0`
 * @throws {RangeUtilError} If `options.step` is positive while the range traverses negatively (`start` > `end`), or negative while the range traverses positively
 */
export function range<const T = number>(startOrLength: number, end?: number, options?: RangeOptions<T>): Range<T> {
	const startValue = typeof end === "number" ? startOrLength : 0;
	const endValue = typeof end === "number" ? end : startOrLength;

	return new Range<T>({
		start: startValue,
		end: endValue,
		step: options?.step,
		mapper: options?.valueMapper,
	});
}
