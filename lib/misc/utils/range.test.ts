import { describe, expect, mock, test } from "bun:test";
import { RangeUtilError, range } from "./range";

describe("range", () => {
	test("Simple range", () => {
		const fn = mock((i) => i);

		for (const index of range(4)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(0);
		expect(calls[1].value).toBe(1);
		expect(calls[2].value).toBe(2);
		expect(calls[3].value).toBe(3);
		expect(calls[4].value).toBe(4);
	});

	test("Simple range with end", () => {
		const fn = mock((i) => i);

		for (const index of range(0, 4)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(0);
		expect(calls[1].value).toBe(1);
		expect(calls[2].value).toBe(2);
		expect(calls[3].value).toBe(3);
		expect(calls[4].value).toBe(4);
	});

	test("Simple range with start and end", () => {
		const fn = mock((i) => i);

		for (const index of range(2, 4)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(2);
		expect(calls[1].value).toBe(3);
		expect(calls[2].value).toBe(4);
	});

	test("Simple range with step", () => {
		const fn = mock((i) => i);

		for (const index of range(0, 4, {
			step: 2,
		})) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(0);
		expect(calls[1].value).toBe(2);
		expect(calls[2].value).toBe(4);
	});

	test("Simple range with mapping literal", () => {
		const fn = mock((i) => i);

		for (const value of range(0, 4, {
			valueMapper: "foo",
		})) {
			fn(value);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
			expect(call.value).toBe("foo");
		}
	});

	test("Simple range with mapping function", () => {
		const fn = mock((i) => i);

		for (const value of range(0, 4, {
			valueMapper: (step) => `foo-${step}`,
		})) {
			fn(value);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe("foo-0");
		expect(calls[1].value).toBe("foo-1");
		expect(calls[2].value).toBe("foo-2");
		expect(calls[3].value).toBe("foo-3");
		expect(calls[4].value).toBe("foo-4");
	});

	test("Simple range with mapping literal and step", () => {
		const fn = mock((i) => i);

		for (const value of range(0, 8, {
			step: 2,
			valueMapper: "foo",
		})) {
			fn(value);
		}

		expect(fn).toBeCalledTimes(5);

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
			valueMapper: (step) => `foo-${step}`,
		})) {
			fn(value);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe("foo-0");
		expect(calls[1].value).toBe("foo-2");
		expect(calls[2].value).toBe("foo-4");
		expect(calls[3].value).toBe("foo-6");
		expect(calls[4].value).toBe("foo-8");
	});

	test("Zero-length range", () => {
		const fn = mock((i) => i);

		for (const index of range(0)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(1);

		const calls = fn.mock.results;

		expect(calls[0].type).toBe("return");
		expect(calls[0].value).toBe(0);
	});

	test("Range where start equals end", () => {
		const fn = mock((i) => i);

		for (const index of range(3, 3)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(1);

		const calls = fn.mock.results;

		expect(calls[0].type).toBe("return");
		expect(calls[0].value).toBe(3);
	});

	test("Range with negative start and end", () => {
		const fn = mock((i) => i);

		for (const index of range(-3, -1)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(-3);
		expect(calls[1].value).toBe(-2);
		expect(calls[2].value).toBe(-1);
	});

	test("Range with a non-integer step", () => {
		const fn = mock((i) => i);

		for (const index of range(0, 2, {
			step: 0.5,
		})) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(0);
		expect(calls[1].value).toBe(0.5);
		expect(calls[2].value).toBe(1);
		expect(calls[3].value).toBe(1.5);
		expect(calls[4].value).toBe(2);
	});

	test("Range with a length and options only (no explicit end)", () => {
		const fn = mock((i) => i);

		for (const index of range(4, undefined, {
			step: 2,
		})) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(0);
		expect(calls[1].value).toBe(2);
		expect(calls[2].value).toBe(4);
	});

	test("Descending range (start greater than end)", () => {
		const fn = mock((i) => i);

		for (const index of range(4, 0)) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(5);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(4);
		expect(calls[1].value).toBe(3);
		expect(calls[2].value).toBe(2);
		expect(calls[3].value).toBe(1);
		expect(calls[4].value).toBe(0);
	});

	test("Descending range with a matching negative step", () => {
		const fn = mock((i) => i);

		for (const index of range(6, 0, {
			step: -2,
		})) {
			fn(index);
		}

		expect(fn).toBeCalledTimes(4);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe(6);
		expect(calls[1].value).toBe(4);
		expect(calls[2].value).toBe(2);
		expect(calls[3].value).toBe(0);
	});

	test("Descending range with a mapping function", () => {
		const fn = mock((i) => i);

		for (const value of range(2, 0, {
			valueMapper: (step) => `foo-${step}`,
		})) {
			fn(value);
		}

		expect(fn).toBeCalledTimes(3);

		const calls = fn.mock.results;

		for (const call of calls) {
			expect(call.type).toBe("return");
		}

		expect(calls[0].value).toBe("foo-2");
		expect(calls[1].value).toBe("foo-1");
		expect(calls[2].value).toBe("foo-0");
	});

	test("Range with a step of zero throws a RangeUtilError", () => {
		try {
			const generator = range(0, 2, {
				step: 0,
			});
			generator.next();
			expect().fail("Expected range to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(RangeUtilError);
			expect((err as RangeUtilError).util).toBe("range");
			expect((err as RangeUtilError).message).toBe(
				"Step cannot be 0, that would cause the range to become infinite",
			);
		}
	});

	test("Ascending range with a negative step throws a RangeUtilError", () => {
		try {
			const generator = range(0, 4, {
				step: -1,
			});
			generator.next();
			expect().fail("Expected range to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(RangeUtilError);
			expect((err as RangeUtilError).util).toBe("range");
			expect((err as RangeUtilError).message).toBe(
				"Given start and end should cause the range to traverse positively, but step is specified to traverse negatively",
			);
		}
	});

	test("Descending range with a positive step throws a RangeUtilError", () => {
		try {
			const generator = range(4, 0, {
				step: 1,
			});
			generator.next();
			expect().fail("Expected range to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(RangeUtilError);
			expect((err as RangeUtilError).util).toBe("range");
			expect((err as RangeUtilError).message).toBe(
				"Given start and end should cause the range to traverse negatively, but step is specified to traverse positively",
			);
		}
	});
});
