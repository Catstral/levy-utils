import { describe, expect, mock, test } from "bun:test";
import { Range, type RangeDetails, type RangeString, RangeUtilError, range } from ".";

describe("range", () => {
	const testParameters = [
		{
			name: "Full range (string)",
			rangeType: "..",
			start: undefined,
			end: undefined,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with start (string)",
			rangeType: "1..",
			start: 1,
			end: undefined,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with end (string)",
			rangeType: "..10",
			start: undefined,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with inclusive end (string)",
			rangeType: "..=10",
			start: undefined,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: true,
		},
		{
			name: "Range with start and end (string)",
			rangeType: "1..10",
			start: 1,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with start and inclusive end (string)",
			rangeType: "1..=10",
			start: 1,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: true,
		},

		{
			name: "Full range (object)",
			rangeType: {},
			start: undefined,
			end: undefined,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with start (object)",
			rangeType: {
				start: 1,
				end: null,
			},
			start: 1,
			end: undefined,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with end (object)",
			rangeType: {
				start: null,
				end: 10,
			},
			start: undefined,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with start and end (object)",
			rangeType: {
				start: 1,
				end: 10,
			},
			start: 1,
			end: 10,
			step: undefined,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},

		{
			name: "Full range with step (object)",
			rangeType: {
				start: null,
				end: null,
				step: 2,
			},
			start: undefined,
			end: undefined,
			step: 2,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with step and start (object)",
			rangeType: {
				start: 1,
				end: null,
				step: 2,
			},
			start: 1,
			end: undefined,
			step: 2,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with step and end (object)",
			rangeType: {
				start: null,
				end: 10,
				step: 2,
			},
			start: undefined,
			end: 10,
			step: 2,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with step and start and end (object)",
			rangeType: {
				start: 1,
				end: 10,
				step: 2,
			},
			start: 1,
			end: 10,
			step: 2,
			hasMapper: false,
			inclusiveStart: true,
			inclusiveEnd: false,
		},

		{
			name: "Full range with mapper (object)",
			rangeType: {
				start: null,
				end: null,
				mapper: (step: number) => step * 2,
			},
			start: undefined,
			end: undefined,
			step: undefined,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and start (object)",
			rangeType: {
				start: 1,
				end: null,
				mapper: (step: number) => step * 2,
			},
			start: 1,
			end: undefined,
			step: undefined,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and end (object)",
			rangeType: {
				start: null,
				end: 10,
				mapper: (step: number) => step * 2,
			},
			start: undefined,
			end: 10,
			step: undefined,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and start and end (object)",
			rangeType: {
				start: 1,
				end: 10,
				mapper: (step: number) => step * 2,
			},
			start: 1,
			end: 10,
			step: undefined,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},

		{
			name: "Full range mapper and with step (object)",
			rangeType: {
				start: null,
				end: null,
				step: 2,
				mapper: (step: number) => step * 2,
			},
			start: undefined,
			end: undefined,
			step: 2,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and step and start (object)",
			rangeType: {
				start: 1,
				end: null,
				step: 2,
				mapper: (step: number) => step * 2,
			},
			start: 1,
			end: undefined,
			step: 2,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and step and end (object)",
			rangeType: {
				start: null,
				end: 10,
				step: 2,
				mapper: (step: number) => step * 2,
			},
			start: undefined,
			end: 10,
			step: 2,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
		{
			name: "Range with mapper and step and start and end (object)",
			rangeType: {
				start: 1,
				end: 10,
				step: 2,
				mapper: (step: number) => step * 2,
			},
			start: 1,
			end: 10,
			step: 2,
			hasMapper: true,
			inclusiveStart: true,
			inclusiveEnd: false,
		},
	] satisfies {
		name: string;
		rangeType: RangeString | RangeDetails<number>;
		start: number | undefined;
		end: number | undefined;
		step: number | undefined;
		hasMapper: boolean;
		inclusiveStart: boolean;
		inclusiveEnd: boolean;
	}[];

	describe("Util method", () => {
		test("Simple range with length", () => {
			const fn = mock((i) => i);

			for (const index of range(4)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(0);
			expect(calls[1].value).toBe(1);
			expect(calls[2].value).toBe(2);
			expect(calls[3].value).toBe(3);
		});

		test("Simple range with end", () => {
			const fn = mock((i) => i);

			for (const index of range(0, 4)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(0);
			expect(calls[1].value).toBe(1);
			expect(calls[2].value).toBe(2);
			expect(calls[3].value).toBe(3);
		});

		test("Simple range with start and end", () => {
			const fn = mock((i) => i);

			for (const index of range(2, 4)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(2);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(2);
			expect(calls[1].value).toBe(3);
		});

		test("Simple range with step", () => {
			const fn = mock((i) => i);

			for (const index of range(0, 4, {
				step: 2,
			})) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(2);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(0);
			expect(calls[1].value).toBe(2);
		});

		test("Simple range with mapping literal", () => {
			const fn = mock((i) => i);

			for (const value of range(0, 4, {
				valueMapper: "foo",
			})) {
				fn(value);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
				expect(call.value).toBe("foo");
			}
		});

		test("Simple range with mapping function", () => {
			const fn = mock((i) => i);

			for (const value of range(0, 4, {
				valueMapper: (step: number) => `foo-${step}`,
			})) {
				fn(value);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe("foo-0");
			expect(calls[1].value).toBe("foo-1");
			expect(calls[2].value).toBe("foo-2");
			expect(calls[3].value).toBe("foo-3");
		});

		test("Simple range with mapping literal and step", () => {
			const fn = mock((i) => i);

			for (const value of range(0, 8, {
				step: 2,
				valueMapper: "foo",
			})) {
				fn(value);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
				expect(call.value).toBe("foo");
			}
		});

		test("Simple range with mapping function and step", () => {
			const fn = mock((i) => i);

			for (const value of range(0, 8, {
				step: 2,
				valueMapper: (step: number) => `foo-${step}`,
			})) {
				fn(value);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe("foo-0");
			expect(calls[1].value).toBe("foo-2");
			expect(calls[2].value).toBe("foo-4");
			expect(calls[3].value).toBe("foo-6");
		});

		test("Zero-length range", () => {
			const fn = mock((i) => i);

			for (const index of range(0)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(0);
		});

		test("Range where start equals end", () => {
			const fn = mock((i) => i);

			for (const index of range(3, 3)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(0);
		});

		test("Range with negative start and end", () => {
			const fn = mock((i) => i);

			for (const index of range(-3, -1)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(2);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(-3);
			expect(calls[1].value).toBe(-2);
		});

		test("Range with a non-integer step", () => {
			const fn = mock((i) => i);

			for (const index of range(0, 2, {
				step: 0.5,
			})) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(0);
			expect(calls[1].value).toBe(0.5);
			expect(calls[2].value).toBe(1);
			expect(calls[3].value).toBe(1.5);
		});

		test("Range with a length and options only (no explicit end)", () => {
			const fn = mock((i) => i);

			for (const index of range(4, undefined, {
				step: 2,
			})) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(2);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(0);
			expect(calls[1].value).toBe(2);
		});

		test("Descending range (start greater than end)", () => {
			const fn = mock((i) => i);

			for (const index of range(4, 0)) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(4);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(4);
			expect(calls[1].value).toBe(3);
			expect(calls[2].value).toBe(2);
			expect(calls[3].value).toBe(1);
		});

		test("Descending range with a matching negative step", () => {
			const fn = mock((i) => i);

			for (const index of range(6, 0, {
				step: -2,
			})) {
				fn(index);
			}

			expect(fn).toBeCalledTimes(3);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe(6);
			expect(calls[1].value).toBe(4);
			expect(calls[2].value).toBe(2);
		});

		test("Descending range with a mapping function", () => {
			const fn = mock((i) => i);

			for (const value of range(2, 0, {
				valueMapper: (step: number) => `foo-${step}`,
			})) {
				fn(value);
			}

			expect(fn).toBeCalledTimes(2);

			const calls = fn.mock.results;

			for (const call of calls) {
				expect(call.type).toBe("return");
			}

			expect(calls[0].value).toBe("foo-2");
			expect(calls[1].value).toBe("foo-1");
		});

		test("Range with a step of zero throws a RangeUtilError", () => {
			try {
				for (const _ of range(0, 2, {
					step: 0,
				})) {
					expect().fail("Expected range to throw");
				}

				expect().fail("Expected range to throw");
			} catch (err) {
				expect(err).toBeInstanceOf(RangeUtilError);
				expect((err as RangeUtilError).util).toBe("range");
				expect((err as RangeUtilError & { message: string }).message).toBe(
					"Step cannot be 0, that would cause the range to become infinite",
				);
			}
		});

		test("Ascending range with a negative step throws a RangeUtilError", () => {
			try {
				for (const _ of range(0, 4, {
					step: -1,
				})) {
					expect().fail("Expected range to throw");
				}

				expect().fail("Expected range to throw");
			} catch (err) {
				expect(err).toBeInstanceOf(RangeUtilError);
				expect((err as RangeUtilError).util).toBe("range");
				expect((err as RangeUtilError & { message: string }).message).toBe(
					"Given start and end should cause the range to traverse positively, but step is specified to traverse negatively",
				);
			}
		});

		test("Descending range with a positive step throws a RangeUtilError", () => {
			try {
				for (const _ of range(4, 0, {
					step: 1,
				})) {
					expect().fail("Expected range to throw");
				}

				expect().fail("Expected range to throw");
			} catch (err) {
				expect(err).toBeInstanceOf(RangeUtilError);
				expect((err as RangeUtilError).util).toBe("range");
				expect((err as RangeUtilError & { message: string }).message).toBe(
					"Given start and end should cause the range to traverse negatively, but step is specified to traverse positively",
				);
			}
		});

		describe("Data parsing", () => {
			test.each(testParameters)("$name", ({ rangeType, start, end, step, hasMapper, inclusiveEnd }) => {
				let currentRange: Range;

				if (typeof rangeType === "string") {
					currentRange = range(rangeType);
				} else {
					currentRange = range(rangeType.start, rangeType.end, {
						step: rangeType.step,
						valueMapper: rangeType.mapper,
						inclusiveStart: rangeType.inclusiveStart,
						inclusiveEnd: rangeType.inclusiveEnd,
					});
				}

				expect(currentRange.details.start).toBe(start);
				expect(currentRange.details.end).toBe(end);
				expect(currentRange.details.inclusiveEnd).toBe(inclusiveEnd);
				expect(currentRange.details.step).toBe(step);

				if (hasMapper) {
					expect(currentRange.details.mapper).not.toBeUndefined();
				} else {
					expect(currentRange.details.mapper).toBeUndefined();
				}
			});
		});

		describe("Cloning", () => {
			describe("Static cloning", () => {
				test.each(testParameters)("$name", ({ rangeType }) => {
					let currentRange: Range;

					if (typeof rangeType === "string") {
						currentRange = range(rangeType);
					} else {
						currentRange = range(rangeType.start, rangeType.end, {
							step: rangeType.step,
							valueMapper: rangeType.mapper,
							inclusiveStart: rangeType.inclusiveStart,
							inclusiveEnd: rangeType.inclusiveEnd,
						});
					}

					const cloned = Range.from(currentRange);

					expect(currentRange).not.toBe(cloned);
					expect(currentRange.details.start).toBe(cloned.details.start);
					expect(currentRange.details.end).toBe(cloned.details.end);
					expect(currentRange.details.step).toBe(cloned.details.step);
					expect(currentRange.details.mapper).toBe(cloned.details.mapper);
				});
			});

			describe("Cloning method", () => {
				test.each(testParameters)("$name", ({ rangeType }) => {
					let currentRange: Range;

					if (typeof rangeType === "string") {
						currentRange = range(rangeType);
					} else {
						currentRange = range(rangeType.start, rangeType.end, {
							step: rangeType.step,
							valueMapper: rangeType.mapper,
							inclusiveStart: rangeType.inclusiveStart,
							inclusiveEnd: rangeType.inclusiveEnd,
						});
					}

					const cloned = currentRange.clone();

					expect(currentRange).not.toBe(cloned);
					expect(currentRange.details.start).toBe(cloned.details.start);
					expect(currentRange.details.end).toBe(cloned.details.end);
					expect(currentRange.details.step).toBe(cloned.details.step);
					expect(currentRange.details.mapper).toBe(cloned.details.mapper);
				});
			});
		});
	});

	describe("Class usage", () => {
		describe("Iteration tests", () => {});

		describe("Non-iteration tests", () => {
			describe("Full range", () => {
				test("All numbers are between range", () => {
					const range = new Range("..");

					expect(range.isBetween(0)).toBeTrue();
					expect(range.isBetween(1)).toBeTrue();
					expect(range.isBetween(-1)).toBeTrue();
					expect(range.isBetween(Infinity)).toBeTrue();
					expect(range.isBetween(-Infinity)).toBeTrue();
					expect(range.isBetween(NaN)).toBeTrue();
				});

				test("All numbers are between or on range", () => {
					const range = new Range("..");

					expect(range.isBetweenOrOn(0)).toBeTrue();
					expect(range.isBetweenOrOn(1)).toBeTrue();
					expect(range.isBetweenOrOn(-1)).toBeTrue();
					expect(range.isBetweenOrOn(Infinity)).toBeTrue();
					expect(range.isBetweenOrOn(-Infinity)).toBeTrue();
					expect(range.isBetweenOrOn(NaN)).toBeTrue();
				});

				test("No numbers are outside range", () => {
					const range = new Range("..");

					expect(range.isOutside(0)).toBeFalse();
					expect(range.isOutside(1)).toBeFalse();
					expect(range.isOutside(-1)).toBeFalse();
					expect(range.isOutside(Infinity)).toBeFalse();
					expect(range.isOutside(-Infinity)).toBeFalse();
					expect(range.isOutside(NaN)).toBeFalse();
				});

				test("No numbers are on or outside range", () => {
					const range = new Range("..");

					expect(range.isOutsideOrOn(0)).toBeFalse();
					expect(range.isOutsideOrOn(1)).toBeFalse();
					expect(range.isOutsideOrOn(-1)).toBeFalse();
					expect(range.isOutsideOrOn(Infinity)).toBeFalse();
					expect(range.isOutsideOrOn(-Infinity)).toBeFalse();
					expect(range.isOutsideOrOn(NaN)).toBeFalse();
				});

				test("No numbers are on range", () => {
					const range = new Range("..");

					expect(range.isOn(0)).toBeFalse();
					expect(range.isOn(1)).toBeFalse();
					expect(range.isOn(-1)).toBeFalse();
					expect(range.isOn(Infinity)).toBeFalse();
					expect(range.isOn(-Infinity)).toBeFalse();
					expect(range.isOn(NaN)).toBeFalse();
				});
			});

			describe("Range with start", () => {
				test("Number above start are between range and numbers below or equal to start are not between range", () => {
					const range = new Range("0..");

					expect(range.isBetween(0)).toBeFalse();
					expect(range.isBetween(1)).toBeTrue();
					expect(range.isBetween(-1)).toBeFalse();
					expect(range.isBetween(Infinity)).toBeTrue();
					expect(range.isBetween(-Infinity)).toBeFalse();
					expect(range.isBetween(NaN)).toBeFalse();
				});

				test("Number above or equal to start are between or on range and numbers below start are not between or on range", () => {
					const range = new Range("0..");

					expect(range.isBetweenOrOn(0)).toBeTrue();
					expect(range.isBetweenOrOn(1)).toBeTrue();
					expect(range.isBetweenOrOn(-1)).toBeFalse();
					expect(range.isBetweenOrOn(Infinity)).toBeTrue();
					expect(range.isBetweenOrOn(-Infinity)).toBeFalse();
					expect(range.isBetweenOrOn(NaN)).toBeFalse();
				});

				test("All numbers below start are outside or on range and all numbers above or equal to start are not outside or on range", () => {
					const range = new Range("0..");

					expect(range.isOutside(0)).toBeFalse();
					expect(range.isOutside(1)).toBeFalse();
					expect(range.isOutside(-1)).toBeTrue();
					expect(range.isOutside(Infinity)).toBeFalse();
					expect(range.isOutside(-Infinity)).toBeTrue();
					expect(range.isOutside(NaN)).toBeFalse();
				});

				test("All numbers below or equal to start are outside or on range and all numbers above start are not outside or on range", () => {
					const range = new Range("0..");

					expect(range.isOutsideOrOn(0)).toBeTrue();
					expect(range.isOutsideOrOn(1)).toBeFalse();
					expect(range.isOutsideOrOn(-1)).toBeTrue();
					expect(range.isOutsideOrOn(Infinity)).toBeFalse();
					expect(range.isOutsideOrOn(-Infinity)).toBeTrue();
					expect(range.isOutsideOrOn(NaN)).toBeFalse();
				});

				test("Only value equal to start is on range", () => {
					const range = new Range("0..");

					expect(range.isOn(0)).toBeTrue();
					expect(range.isOn(1)).toBeFalse();
					expect(range.isOn(-1)).toBeFalse();
					expect(range.isOn(Infinity)).toBeFalse();
					expect(range.isOn(-Infinity)).toBeFalse();
					expect(range.isOn(NaN)).toBeFalse();
				});
			});

			describe("Range with end", () => {
				test("Number below end are between range and numbers above or equal to end are not between range", () => {
					const range = new Range("..=0");

					expect(range.isBetween(0)).toBeFalse();
					expect(range.isBetween(1)).toBeFalse();
					expect(range.isBetween(-1)).toBeTrue();
					expect(range.isBetween(Infinity)).toBeFalse();
					expect(range.isBetween(-Infinity)).toBeTrue();
					expect(range.isBetween(NaN)).toBeFalse();
				});

				test("Number below or equal to end are between or on range and numbers above end are not between or on range", () => {
					const range = new Range("..=0");

					expect(range.isBetweenOrOn(0)).toBeTrue();
					expect(range.isBetweenOrOn(1)).toBeFalse();
					expect(range.isBetweenOrOn(-1)).toBeTrue();
					expect(range.isBetweenOrOn(Infinity)).toBeFalse();
					expect(range.isBetweenOrOn(-Infinity)).toBeTrue();
					expect(range.isBetweenOrOn(NaN)).toBeFalse();
				});

				test("All numbers above end are outside or on range and all numbers below or equal to end are not outside or on range", () => {
					const range = new Range("..=0");

					expect(range.isOutside(0)).toBeFalse();
					expect(range.isOutside(1)).toBeTrue();
					expect(range.isOutside(-1)).toBeFalse();
					expect(range.isOutside(Infinity)).toBeTrue();
					expect(range.isOutside(-Infinity)).toBeFalse();
					expect(range.isOutside(NaN)).toBeFalse();
				});

				test("All numbers above or equal to end are outside or on range and all numbers below end are not outside or on range", () => {
					const range = new Range("..=0");

					expect(range.isOutsideOrOn(0)).toBeTrue();
					expect(range.isOutsideOrOn(1)).toBeTrue();
					expect(range.isOutsideOrOn(-1)).toBeFalse();
					expect(range.isOutsideOrOn(Infinity)).toBeTrue();
					expect(range.isOutsideOrOn(-Infinity)).toBeFalse();
					expect(range.isOutsideOrOn(NaN)).toBeFalse();
				});

				test("Only value equal to end is on range", () => {
					const range = new Range("..=0");

					expect(range.isOn(0)).toBeTrue();
					expect(range.isOn(1)).toBeFalse();
					expect(range.isOn(-1)).toBeFalse();
					expect(range.isOn(Infinity)).toBeFalse();
					expect(range.isOn(-Infinity)).toBeFalse();
					expect(range.isOn(NaN)).toBeFalse();
				});
			});

			describe("Range with start and end", () => {
				describe("Range moving towards positive infinity", () => {
					test("All number above start and below end are between range and all numbers below or equal to start or above or equal to end are not between range", () => {
						const range = new Range("0..=10");

						expect(range.isBetween(-1)).toBeFalse();
						expect(range.isBetween(0)).toBeFalse();
						expect(range.isBetween(1)).toBeTrue();
						expect(range.isBetween(9)).toBeTrue();
						expect(range.isBetween(10)).toBeFalse();
						expect(range.isBetween(11)).toBeFalse();
						expect(range.isBetween(Infinity)).toBeFalse();
						expect(range.isBetween(-Infinity)).toBeFalse();
						expect(range.isBetween(NaN)).toBeFalse();
					});

					test("All number above or equal to start and below or equal to end are between or on range and all numbers below start or above end are not between or on range", () => {
						const range = new Range("0..=10");

						expect(range.isBetweenOrOn(-1)).toBeFalse();
						expect(range.isBetweenOrOn(0)).toBeTrue();
						expect(range.isBetweenOrOn(1)).toBeTrue();
						expect(range.isBetweenOrOn(9)).toBeTrue();
						expect(range.isBetweenOrOn(10)).toBeTrue();
						expect(range.isBetweenOrOn(11)).toBeFalse();
						expect(range.isBetweenOrOn(Infinity)).toBeFalse();
						expect(range.isBetweenOrOn(-Infinity)).toBeFalse();
						expect(range.isBetweenOrOn(NaN)).toBeFalse();
					});

					test("All numbers below start or above end are outside of range and all numbers above or equal to start and below or equal to end are not outside range", () => {
						const range = new Range("0..=10");

						expect(range.isOutside(-1)).toBeTrue();
						expect(range.isOutside(0)).toBeFalse();
						expect(range.isOutside(1)).toBeFalse();
						expect(range.isOutside(9)).toBeFalse();
						expect(range.isOutside(10)).toBeFalse();
						expect(range.isOutside(11)).toBeTrue();
						expect(range.isOutside(Infinity)).toBeTrue();
						expect(range.isOutside(-Infinity)).toBeTrue();
						expect(range.isOutside(NaN)).toBeFalse();
					});

					test("All number below or equal to start or below or equal to end are outside or on range and all numbers above start and below end are not outside or on range", () => {
						const range = new Range("0..=10");

						expect(range.isOutsideOrOn(-1)).toBeTrue();
						expect(range.isOutsideOrOn(0)).toBeTrue();
						expect(range.isOutsideOrOn(1)).toBeFalse();
						expect(range.isOutsideOrOn(9)).toBeFalse();
						expect(range.isOutsideOrOn(10)).toBeTrue();
						expect(range.isOutsideOrOn(11)).toBeTrue();
						expect(range.isOutsideOrOn(Infinity)).toBeTrue();
						expect(range.isOutsideOrOn(-Infinity)).toBeTrue();
						expect(range.isOutsideOrOn(NaN)).toBeFalse();
					});

					test("Only value equal to start or equal to end is on range", () => {
						const range = new Range("0..=10");

						expect(range.isOn(-1)).toBeFalse();
						expect(range.isOn(0)).toBeTrue();
						expect(range.isOn(1)).toBeFalse();
						expect(range.isOn(9)).toBeFalse();
						expect(range.isOn(10)).toBeTrue();
						expect(range.isOn(11)).toBeFalse();
						expect(range.isOn(Infinity)).toBeFalse();
						expect(range.isOn(-Infinity)).toBeFalse();
						expect(range.isOn(NaN)).toBeFalse();
					});
				});

				describe("Range moving towards negative infinity", () => {
					test("All number below start and above end are between range and all numbers above or equal to start or below or equal to end are not between range", () => {
						const range = new Range("10..=0");

						expect(range.isBetween(-1)).toBeFalse();
						expect(range.isBetween(0)).toBeFalse();
						expect(range.isBetween(1)).toBeTrue();
						expect(range.isBetween(9)).toBeTrue();
						expect(range.isBetween(10)).toBeFalse();
						expect(range.isBetween(11)).toBeFalse();
						expect(range.isBetween(Infinity)).toBeFalse();
						expect(range.isBetween(-Infinity)).toBeFalse();
						expect(range.isBetween(NaN)).toBeFalse();
					});

					test("All number above or equal to start and below or equal to end are between or on range and all numbers above start or below end are not between or on range", () => {
						const range = new Range("10..=0");

						expect(range.isBetweenOrOn(-1)).toBeFalse();
						expect(range.isBetweenOrOn(0)).toBeTrue();
						expect(range.isBetweenOrOn(1)).toBeTrue();
						expect(range.isBetweenOrOn(9)).toBeTrue();
						expect(range.isBetweenOrOn(10)).toBeTrue();
						expect(range.isBetweenOrOn(11)).toBeFalse();
						expect(range.isBetweenOrOn(Infinity)).toBeFalse();
						expect(range.isBetweenOrOn(-Infinity)).toBeFalse();
						expect(range.isBetweenOrOn(NaN)).toBeFalse();
					});

					test("All numbers above start or below end are outside of range and all numbers below or equal to start and above or equal to end are not outside range", () => {
						const range = new Range("10..=0");

						expect(range.isOutside(-1)).toBeTrue();
						expect(range.isOutside(0)).toBeFalse();
						expect(range.isOutside(1)).toBeFalse();
						expect(range.isOutside(9)).toBeFalse();
						expect(range.isOutside(10)).toBeFalse();
						expect(range.isOutside(11)).toBeTrue();
						expect(range.isOutside(Infinity)).toBeTrue();
						expect(range.isOutside(-Infinity)).toBeTrue();
						expect(range.isOutside(NaN)).toBeFalse();
					});

					test("All number above or equal to start or below or equal to end are outside or on range and all numbers below start and above end are not outside or on range", () => {
						const range = new Range("10..=0");

						expect(range.isOutsideOrOn(-1)).toBeTrue();
						expect(range.isOutsideOrOn(0)).toBeTrue();
						expect(range.isOutsideOrOn(1)).toBeFalse();
						expect(range.isOutsideOrOn(9)).toBeFalse();
						expect(range.isOutsideOrOn(10)).toBeTrue();
						expect(range.isOutsideOrOn(11)).toBeTrue();
						expect(range.isOutsideOrOn(Infinity)).toBeTrue();
						expect(range.isOutsideOrOn(-Infinity)).toBeTrue();
						expect(range.isOutsideOrOn(NaN)).toBeFalse();
					});

					test("Only value equal to start or equal to end is on range", () => {
						const range = new Range("10..=0");

						expect(range.isOn(-1)).toBeFalse();
						expect(range.isOn(0)).toBeTrue();
						expect(range.isOn(1)).toBeFalse();
						expect(range.isOn(9)).toBeFalse();
						expect(range.isOn(10)).toBeTrue();
						expect(range.isOn(11)).toBeFalse();
						expect(range.isOn(Infinity)).toBeFalse();
						expect(range.isOn(-Infinity)).toBeFalse();
						expect(range.isOn(NaN)).toBeFalse();
					});
				});
			});
		});

		describe("Data parsing", () => {
			test.each(testParameters)("$name", ({ rangeType, start, end, step, hasMapper }) => {
				const range = new Range(rangeType);

				expect(range.details.start).toBe(start);
				expect(range.details.end).toBe(end);
				expect(range.details.step).toBe(step);

				if (hasMapper) {
					expect(range.details.mapper).not.toBeUndefined();
				} else {
					expect(range.details.mapper).toBeUndefined();
				}
			});

			describe("Delayed value setting", () => {
				test("Setting start", () => {
					const range = new Range();
					const updateRange = range.start(1);

					expect(range).not.toBe(updateRange);
					expect(range.details.start).toBeUndefined();
					expect(updateRange.details.start).toBe(1);
				});

				test("Setting end", () => {
					const range = new Range();
					const updateRange = range.end(1);

					expect(range).not.toBe(updateRange);
					expect(range.details.end).toBeUndefined();
					expect(updateRange.details.end).toBe(1);
				});

				test("Setting step", () => {
					const range = new Range();
					const updateRange = range.step(1);

					expect(range).not.toBe(updateRange);
					expect(range.details.step).toBeUndefined();
					expect(updateRange.details.step).toBe(1);
				});

				test("Setting mapper", () => {
					const range = new Range();
					const updateRange = range.map(1);

					expect(range).not.toBe(updateRange);
					expect(range.details.mapper).toBeUndefined();
					expect(updateRange.details.mapper).toBe(1);
				});
			});
		});

		describe("Cloning", () => {
			describe("Static cloning", () => {
				test.each(testParameters)("$name", ({ rangeType }) => {
					const range = new Range(rangeType);
					const cloned = Range.from(range);

					expect(range).not.toBe(cloned);
					expect(range.details.start).toBe(cloned.details.start);
					expect(range.details.end).toBe(cloned.details.end);
					expect(range.details.step).toBe(cloned.details.step);
					expect(range.details.mapper).toBe(cloned.details.mapper);
				});
			});

			describe("Cloning method", () => {
				test.each(testParameters)("$name", ({ rangeType }) => {
					const range = new Range(rangeType);
					const cloned = range.clone();

					expect(range).not.toBe(cloned);
					expect(range.details.start).toBe(cloned.details.start);
					expect(range.details.end).toBe(cloned.details.end);
					expect(range.details.step).toBe(cloned.details.step);
					expect(range.details.mapper).toBe(cloned.details.mapper);
				});
			});
		});

		describe("Range to Array", () => {
			test("Simple range", () => {
				const range = new Range("1..=10");
				const arr = range.toArray();

				expect(arr).toBeArray();
				expect(arr).toBeArrayOfSize(10);
				expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			});

			test("Simple range with step", () => {
				const range = new Range("1..=10").step(2);
				const arr = range.toArray();

				expect(arr).toBeArray();
				expect(arr).toBeArrayOfSize(5);
				expect(arr).toEqual([1, 3, 5, 7, 9]);
			});

			test("Simple range with static mapper", () => {
				const range = new Range("1..=10").map<"foo">("foo");
				const arr = range.toArray();

				expect(arr).toBeArray();
				expect(arr).toBeArrayOfSize(10);
				expect(arr).toEqual(["foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo"]);
			});

			test("Simple range with mapper function", () => {
				const range = new Range("1..=10").map((step: number) => step * 2);
				const arr = range.toArray();

				expect(arr).toBeArray();
				expect(arr).toBeArrayOfSize(10);
				expect(arr).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
			});

			test("Fail on incomplete range", () => {
				try {
					const range = new Range();
					range.toArray();

					expect().fail(
						"Should not be able to create an array when a range is missing either a start or end value",
					);
				} catch (err) {
					expect(err).toBeInstanceOf(RangeUtilError);
					expect((err as RangeUtilError).util).toBe("range");
					expect((err as RangeUtilError & { message: string }).message).toBe(
						"A range must have a start value defined before it becomes iterable, if it isn't defined it can only be used for checking values",
					);
				}
			});
		});
	});
});
