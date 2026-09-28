import { describe, expect, mock, test } from "bun:test";
import { pipe } from ".";

describe("pipe", () => {
	test("Passes the value to the callback and returns the result", () => {
		const result = pipe(5, (n) => n * 2);

		expect(result).toBe(10);
	});

	test("Executes the callback exactly once", () => {
		const callback = mock((n: number) => n + 1);
		const result = pipe(10, callback);

		expect(result).toBe(11);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(10);
	});

	test("Returns undefined if the callback is void", () => {
		const result = pipe(true, () => {});

		expect(result).toBeUndefined();
	});
});
