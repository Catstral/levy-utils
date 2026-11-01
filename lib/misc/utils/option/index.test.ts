import { beforeEach, describe, expect, expectTypeOf, mock, test } from "bun:test";
import { type Option, safe, unwrap } from ".";

describe("option", () => {
	beforeEach(() => {
		safe.config.reset();
		unwrap.config.reset();
	});

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

		test("Passes parameters to the callback", () => {
			const fn = mock((a: number, b: string) => `${a}${b}`);
			const option = safe(fn, 1, "a");

			expect(fn).toBeCalledWith(1, "a");
			expect(option.success).toBe(true);
			expect(option.value).toBe("1a");
		});

		test("Passes no parameters when none are given", () => {
			const fn = mock(() => 1);

			safe(fn);

			expect(fn).toBeCalledWith();
		});

		test("Returns a failed option when a callback with parameters throws", () => {
			const option = safe((value: number) => {
				throw value;
			}, 5);

			expect(option.success).toBe(false);
			expect(option.error).toBe(5);
			expect(option.value).toBeUndefined();
		});

		test("Returns a promise of a successful option for a resolving callback", async () => {
			const result = safe(async () => 1);

			expect(result).toBeInstanceOf(Promise);

			const option = await result;

			expect(option.success).toBe(true);
			expect(option.value).toBe(1);
			expect(option.error).toBeUndefined();
		});

		test("Returns a promise of a failed option for a rejecting callback", async () => {
			const result = safe(async () => {
				throw 0;
			});

			expect(result).toBeInstanceOf(Promise);

			const option = await result;

			expect(option.success).toBe(false);
			expect(option.error).toBe(0);
			expect(option.value).toBeUndefined();
		});

		test("Passes parameters to an async callback", async () => {
			const fn = mock(async (a: number, b: number) => a + b);
			const option = await safe(fn, 1, 2);

			expect(fn).toBeCalledWith(1, 2);
			expect(option.success).toBe(true);
			expect(option.value).toBe(3);
		});

		test("Returns a failed option synchronously when a callback throws before returning a promise", () => {
			const option = safe((): Promise<number> => {
				throw 0;
			});

			expect(option).not.toBeInstanceOf(Promise);
			expect<unknown>(option).toEqual({ success: false, error: 0 });
		});

		describe("types", () => {
			test("Infers an option for a synchronous callback", () => {
				expectTypeOf(safe(() => "x")).toEqualTypeOf<Option<"x">>();
			});

			test("Infers an option of never for a callback that always throws", () => {
				expectTypeOf(
					safe(() => {
						throw 0;
					}),
				).toEqualTypeOf<Option<never>>();
			});

			test("Infers a promise of an option for an async callback", () => {
				expectTypeOf(safe(async () => 1)).toEqualTypeOf<Promise<Option<1>>>();
			});

			test("Infers a promise of an option for an async callback with parameters", () => {
				expectTypeOf(safe(async (a: number, b: number) => a + b, 1, 2)).toEqualTypeOf<
					Promise<Option<number>>
				>();
			});

			test("Infers both results for a callback that may return a promise", () => {
				expectTypeOf(safe((): number | Promise<number> => 1)).toEqualTypeOf<
					Option<number> | Promise<Option<number>>
				>();
			});
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
