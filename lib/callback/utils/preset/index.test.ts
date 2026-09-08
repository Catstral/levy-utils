import { describe, expect, mock, test } from "bun:test";
import { preset } from ".";

describe("preset", () => {
	test("Calls the mapper with the given arguments and uses its result as parameters", () => {
		const mapper = mock((flag: boolean): [string, boolean] => ["foo", flag]);
		const fn = mock((value: string, flag: boolean) => (flag ? value : "No"));

		const presetFn = preset(fn, mapper);

		expect(presetFn(true)).toBe("foo");

		expect(mapper).toBeCalledTimes(1);
		expect(mapper).toBeCalledWith(true);

		expect(fn).toBeCalledTimes(1);
		expect(fn).toBeCalledWith("foo", true);
	});

	test("Recomputes the parameters on every call", () => {
		const fn = mock((value: number) => value);

		const presetFn = preset(fn, (value: number): [number] => [value * 2]);

		expect(presetFn(1)).toBe(2);
		expect(presetFn(2)).toBe(4);
		expect(presetFn(3)).toBe(6);

		expect(fn).toBeCalledTimes(3);
	});

	test("Works with a mapper that takes no arguments", () => {
		const fn = mock((value: string) => value.toUpperCase());

		const presetFn = preset(fn, (): [string] => ["foo"]);

		expect(presetFn()).toBe("FOO");
	});
});
