import { describe, expect, mock, test } from "bun:test";
import { safe, unwrap } from ".";

describe("option", () => {
	describe("safe", () => {
		test("Returns a successful option", () => {
			const option = safe<number>(() => {
				return 1;
			});

			expect(option.success).toBe(true);
			expect(option.value).toBe(1);
			expect(option.error).toBeUndefined();
		});

		test("Returns a failed option", () => {
			const option = safe<number>(() => {
				throw 0;
			});

			expect(option.success).toBe(false);
			expect(option.error).toBe(0);
			expect(option.value).toBeUndefined();
		});

		test("Callback is called exactly once", () => {
			const succesfulFn = mock(() => 1);
			const failedFn = mock(() => {
				throw 0;
			});

			safe(succesfulFn);
			safe(failedFn);

			expect(succesfulFn).toBeCalledTimes(1);
			expect(failedFn).toBeCalledTimes(1);
		});
	});

	describe("unwrap", () => {
		test("Returns a value for a successful option", () => {
			const option = safe<number>(() => {
				return 1;
			});
			const result = unwrap(option);

			expect(result).toBe(1);
		});

		test("Throws for a failed option", () => {
			const option = safe<number>(() => {
				throw 0;
			});
			const fn = mock(() => unwrap(option));

			expect(fn).toThrow();
			expect(option.error).toBe(0);
		});

		test("Prevents a failed option throw by defaulting to a fallback", () => {
			const option = safe<number>(() => {
				throw 0;
			});
			const fn = mock(() => unwrap(option, null));

			expect(fn).not.toThrow();
			expect(fn()).toBeNull();
		});
	});
});
