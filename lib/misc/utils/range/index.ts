import { UtilError } from "~/error";
import { type Computable, compute } from "~/misc/utils/compute";

export class RangeUtilError extends UtilError {
	public readonly util = "range";
}

export type RangeString =
	| ".."
	| `${number}${">" | ""}..`
	| `${number}${">" | ""}..${"=" | ""}${number}`
	| `..${"=" | ""}${number}`;

/**
 * @typedef {Object} RangeDetails
 * @template T
 * @prop {number | null} [start] A number to define the start of the Range
 * @prop {boolean} [inclusiveStart=true] Wether or not the start value is inclusive
 * @prop {number | null} [end] A number to define the end of the Range
 * @prop {boolean} [inclusiveEnd=false] Wether or not the end value is inclusive
 * @prop {number | null} [step] A number to define the step of the Range
 * @prop {Computable<T, [step: number]>} [mapper] A mapper to map the current step of the range to a given value that will be returned by the Range
 */

export interface RangeDetails<T> {
	/**
	 * A number to define the start of the Range.
	 */
	start?: number | null;
	/**
	 * Wether or not the start value is inclusive.
	 *
	 * @default true
	 */
	inclusiveStart?: boolean;
	/**
	 * A number to define the end of the Range.
	 */
	end?: number | null;
	/**
	 * Wether or not the end value is inclusive.
	 *
	 * @default false
	 */
	inclusiveEnd?: boolean;
	/**
	 * A number to define the step of the Range.
	 */
	step?: number | null;
	/**
	 * A mapper to map the current step of the range to a given value that will be returned by the Range.
	 */
	mapper?: Computable<T, [step: number]> | undefined;
}

/**
 * @typedef {Object} InternalRangeDetails
 * @template T
 * @prop {number | null} [start] The current start value of the range
 * @prop {boolean} inclusiveStart The current inclusivity of the start value of the Range
 * @prop {number | null} [end] The current end value of the range
 * @prop {boolean} inclusiveEnd The current inclusivity of the end value of the Range
 * @prop {number | null} [step] The current step value of the range
 * @prop {Computable<T, [step: number]>} [mapper] The current mapper of the range
 */

export interface InternalRangeDetails<T> {
	/**
	 * The current start value of the range.
	 *
	 * @returns {number | undefined} The start value.
	 */
	get start(): number | undefined;
	/**
	 * If the given range should consider the start value to be inclusive.
	 *
	 * @returns {boolean} If the start value is inclusive.
	 */
	get inclusiveStart(): boolean;
	/**
	 * The current end value of the range.
	 *
	 * @returns {number | undefined} The end value.
	 */
	get end(): number | undefined;
	/**
	 * If the given range should consider the end value to be inclusive.
	 *
	 * @returns {boolean} If the end value is inclusive.
	 */
	get inclusiveEnd(): boolean;
	/**
	 * The current step value of the range.
	 *
	 * @returns {number | undefined} The step value.
	 */
	get step(): number | undefined;
	/**
	 * The current mapper of the range.
	 *
	 * @returns {Computable<T, [step: number]> | undefined} The mapper.
	 */
	get mapper(): Computable<T, [step: number]> | undefined;
}

/**
 * A class to hold details about a given range.
 *
 * @template [T=number]
 */
export class Range<const T = number> {
	static #rangeRegex = /^(\d+?(?:\.\d+)?)?(>)?\.\.(=)?(\d+?(?:\.\d+)?)?$/;

	/**
	 * Creates a new Range based on the details of another Range.
	 *
	 * @template T
	 * @param {Range<T>} range A given Range to construct the new Range from
	 * @returns {Range<T>} A new Range with the same details as the given Range.
	 */
	static from<const T>(range: Range<T>): Range<T> {
		return new Range({
			start: range.#start,
			end: range.#end,
			step: range.#step,
			mapper: range.#mapper,
		});
	}

	#start: number | undefined;
	#inclusiveStart: boolean;
	#end: number | undefined;
	#inclusiveEnd: boolean;
	#step: number | undefined;
	#mapper: Computable<T, [step: number]> | undefined;

	public constructor(details?: RangeString);
	public constructor(details: RangeDetails<T>);
	public constructor(details: RangeDetails<T> | RangeString);
	public constructor(details?: RangeDetails<T> | RangeString) {
		if (details === undefined || typeof details === "string") {
			const rangeString = details ?? "..";
			const match = rangeString.match(Range.#rangeRegex);

			if (!match) {
				throw new RangeUtilError("Got a range string, but given range string is not valid");
			}

			const start = match[1] ? Number.parseFloat(match[1]) : null;
			const inclusiveStart = !match[2];
			const inclusiveEnd = !!match[3];
			const end = match[4] ? Number.parseFloat(match[4]) : null;

			this.#inclusiveStart = inclusiveStart;
			this.#inclusiveEnd = inclusiveEnd;

			if (typeof start === "number") {
				this.#start = start;
			}

			if (typeof end === "number") {
				this.#end = end;
			}
		} else {
			if (typeof details.start === "number") {
				this.#start = details.start;
			}

			if (typeof details.end === "number") {
				this.#end = details.end;
			}

			if (typeof details.step === "number") {
				this.#step = details.step;
			}

			this.#inclusiveStart = details.inclusiveStart ?? true;
			this.#inclusiveEnd = details.inclusiveEnd ?? false;
			this.#mapper = details.mapper;
		}
	}

	/**
	 * A getter to be able to read the values of the Range.
	 *
	 * @returns {InternalRangeDetails<T>} The internal details of the range
	 */
	public get details(): InternalRangeDetails<T> {
		const startValue = this.#start;
		const inclusiveStartValue = this.#inclusiveStart;
		const endValue = this.#end;
		const inclusiveEndValue = this.#inclusiveEnd;
		const stepValue = this.#step;
		const mapperValue = this.#mapper;

		return {
			get start() {
				return startValue;
			},
			get inclusiveStart() {
				return inclusiveStartValue;
			},
			get end() {
				return endValue;
			},
			get inclusiveEnd() {
				return inclusiveEndValue;
			},
			get step() {
				return stepValue;
			},
			get mapper() {
				return mapperValue;
			},
		};
	}

	/**
	 * Creates a new Range with the a new start value specified.
	 *
	 * @param {number | null} [start] The start value for the new Range.
	 * @returns {Range<T>} A new Range with the specified start value set.
	 */
	public start(start?: number | null, inclusiveStart: boolean = this.#inclusiveStart): Range<T> {
		return new Range<T>({
			start,
			inclusiveStart,
			end: this.#end,
			inclusiveEnd: this.#inclusiveEnd,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	/**
	 * Creates a new Range with the new inclusivity of the start value specified.
	 *
	 * @param {boolean} inclusiveStart Wether or no the start value should be considered inclusive.
	 * @returns {Range<T>} A new Range with the specified inclusivity of the start value set.
	 */
	public inclusiveStart(inclusiveStart: boolean): Range<T> {
		return new Range<T>({
			start: this.#start,
			inclusiveStart,
			end: this.#end,
			inclusiveEnd: this.#inclusiveEnd,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	/**
	 * Creates a new Range with the a new end value specified.
	 *
	 * @param {number | null} [end] The end value for the new Range.
	 * @param {boolean} [inclusiveEnd=this.#inclusiveEnd] Wether or not the end value should be considered inclusive (defaults to current inclusiveEnd value).
	 * @returns {Range<T>} A new Range with the specified end value set.
	 */
	public end(end?: number | null, inclusiveEnd: boolean = this.#inclusiveEnd): Range<T> {
		return new Range<T>({
			start: this.#start,
			inclusiveStart: this.#inclusiveStart,
			end,
			inclusiveEnd,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	/**
	 * Creates a new Range with the new inclusivity of the end value specified.
	 *
	 * @param {boolean} inclusiveEnd Wether or no the end value should be considered inclusive.
	 * @returns {Range<T>} A new Range with the specified inclusivity of the end value set.
	 */
	public inclusiveEnd(inclusiveEnd: boolean): Range<T> {
		return new Range<T>({
			start: this.#start,
			inclusiveStart: this.#inclusiveStart,
			end: this.#end,
			inclusiveEnd,
			step: this.#step,
			mapper: this.#mapper,
		});
	}

	/**
	 * Creates a new Range with the a new step value specified.
	 *
	 * @param {number | null} [step] The step value for the new Range.
	 * @returns {Range<T>} A new Range with the specified step value set.
	 */
	public step(step?: number | null): Range<T> {
		return new Range<T>({
			start: this.#start,
			inclusiveStart: this.#inclusiveStart,
			end: this.#end,
			inclusiveEnd: this.#inclusiveEnd,
			step,
			mapper: this.#mapper,
		});
	}

	/**
	 * Creates a new Range with the a new mapper specified.
	 *
	 * @template [M=number]
	 * @param {Computable<M, [step: number]> | undefined} mapper The mapper for the new Range.
	 * @returns {Range<M>} A new Range with the specified mapper set.
	 */
	public map<const M = number>(mapper: Computable<M, [step: number]> | undefined): Range<M> {
		return new Range<M>({
			start: this.#start,
			inclusiveStart: this.#inclusiveStart,
			end: this.#end,
			inclusiveEnd: this.#inclusiveEnd,
			step: this.#step,
			mapper,
		});
	}

	/**
	 * Returns a boolean to signal if the given value is on the edges of the range.
	 *
	 * Notes:
	 * - If the range is a full range, then this will **always** return false.
	 * - `NaN` will **always** return false.
	 *
	 * @param {number} value The value to check.
	 * @returns {boolean} A boolean to signal if the specified value is on the edges of the range.
	 */
	public isOn(value: number): boolean {
		return (this.#inclusiveStart && value === this.#start) || (this.#inclusiveEnd && value === this.#end);
	}

	/**
	 * Returns a boolean to signal if the given value is between the edges of the range.
	 *
	 * Notes:
	 * - If the range is a full range, then this will **always** return true.
	 * - `NaN` will **always** return false (unless the range is a full range).
	 *
	 * @param {number} value The value to check.
	 * @returns {boolean} A boolean to signal if the specified value is between the edges of the range.
	 */
	public isBetween(value: number): boolean {
		const isIncremental =
			typeof this.#start === "number" && typeof this.#end === "number" ? this.#end > this.#start : true;
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

	/**
	 * Returns a boolean to signal if the given value is between or on the edges of the range.
	 *
	 * Notes:
	 * - If the range is a full range, then this will **always** return true.
	 * - `NaN` will **always** return false (unless the range is a full range).
	 *
	 * @param {number} value The value to check.
	 * @returns {boolean} A boolean to signal if the specified value is between or on the edges of the range.
	 */
	public isBetweenOrOn(value: number): boolean {
		return this.isBetween(value) || this.isOn(value);
	}

	/**
	 * Returns a boolean to signal if the given value is outside the edges of the range.
	 *
	 * Notes:
	 * - If the range is a full range, then this will **always** return false.
	 * - `NaN` will **always** return false.
	 *
	 * @param {number} value The value to check.
	 * @returns {boolean} A boolean to signal if the specified value is outside the edges of the range.
	 */
	public isOutside(value: number): boolean {
		const isIncremental =
			typeof this.#start === "number" && typeof this.#end === "number" ? this.#end > this.#start : true;
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

	/**
	 * Returns a boolean to signal if the given value is outside or on the edges of the range.
	 *
	 * Notes:
	 * - If the range is a full range, then this will **always** return false.
	 * - `NaN` will **always** return false.
	 *
	 * @param {number} value The value to check.
	 * @returns {boolean} A boolean to signal if the specified value is outside or on the edges of the range.
	 */
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

		const checkValue = () => {
			if (shouldStepDown) {
				if (this.#inclusiveEnd) {
					return value >= endValue;
				}

				return value > endValue;
			}

			if (this.#inclusiveEnd) {
				return value <= endValue;
			}

			return value < endValue;
		};

		if (!this.#inclusiveStart) {
			value += finalStep;
		}

		while (checkValue()) {
			if (this.#mapper !== undefined) {
				yield compute(this.#mapper, value);
			} else {
				yield value as T;
			}

			value += finalStep;
		}
	}

	/**
	 * Returns an array based on the values of the Range.
	 *
	 * @returns {T[]} An array based on the values of the Range.
	 */
	public toArray(): T[] {
		return Array.from(this);
	}

	/**
	 * Returns a new Range with same details.
	 *
	 * @returns {Range<T>} A new Range with same details
	 */
	public clone(): Range<T> {
		return Range.from(this);
	}
}

/**
 * @typedef {Object} RangeOptions
 * @template T
 * @prop {Computable<T, [step: number]>} [valueMapper] A mapper to map the current step of the range to a given value that will be returned by the Range
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
	/**
	 * wether the start value is considered inclusive.
	 *
	 * @default true
	 */
	inclusiveStart?: boolean;
	/**
	 * wether the end value is considered inclusive.
	 *
	 * @default false
	 */
	inclusiveEnd?: boolean;
}

export function range<const T = number>(range: RangeString, options?: RangeOptions<T>): Range<T>;
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
 * @param {number | null | undefined} startOrLength The start of the range, or if this is the only parameter given, the length of the range (inclusive)
 * @param {number | null | undefined} [end] The end of the range (inclusive), if this value is not given (undefined), the `startOrLength` will be used to determine the end
 * @param {RangeOptions<T>} [options] The options used to generate the range (see {@link RangeOptions} for more details)
 * @returns {Range<T>} A Range of a specified range (optionally mapped to a specified value)
 * @throws {RangeUtilError} If `options.step` is `0`
 * @throws {RangeUtilError} If `options.step` is positive while the range traverses negatively (`start` > `end`), or negative while the range traverses positively
 */
export function range<const T = number>(
	startOrLength?: number | null,
	end?: number | null,
	options?: RangeOptions<T>,
): Range<T>;
export function range<const T = number>(
	startOrLengthOrRange?: number | RangeString | null,
	endOrOptions?: number | RangeOptions<T> | null,
	options?: RangeOptions<T>,
): Range<T> {
	if (typeof startOrLengthOrRange === "string") {
		if (typeof endOrOptions === "number") {
			throw new RangeUtilError("cannot define a end number when a range string is used");
		}

		let range = new Range<T>(startOrLengthOrRange);

		if (endOrOptions) {
			if (typeof endOrOptions.step === "number") {
				range = range.step(endOrOptions.step);
			}

			if (typeof endOrOptions.valueMapper !== "undefined") {
				range = range.map(endOrOptions.valueMapper);
			}

			if (typeof endOrOptions.inclusiveStart === "boolean") {
				range = range.inclusiveStart(endOrOptions.inclusiveStart);
			}

			if (typeof endOrOptions.inclusiveEnd === "boolean") {
				range = range.inclusiveEnd(endOrOptions.inclusiveEnd);
			}
		}

		return range;
	}

	const startValue =
		typeof startOrLengthOrRange === "number" || startOrLengthOrRange === null
			? typeof endOrOptions === "number" || endOrOptions === null
				? startOrLengthOrRange
				: 0
			: undefined;
	const endValue = typeof endOrOptions === "number" || endOrOptions === null ? endOrOptions : startOrLengthOrRange;

	return new Range<T>({
		start: startValue,
		end: endValue,
		inclusiveEnd: options?.inclusiveEnd,
		step: options?.step,
		mapper: options?.valueMapper,
	});
}
