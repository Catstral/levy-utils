import { describe, expect, mock, test } from "bun:test";
import { range } from "./range";

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
});
