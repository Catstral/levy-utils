import { describe, expect, mock, test } from "bun:test";
import { match } from ".";

describe("match", () => {
	describe("String target", () => {
		test("Matches a case with a literal value", () => {
			const value = "B" as "A" | "B" | "C";

			expect(
				match(value, {
					A: 1,
					B: 2,
					C: 3,
				}),
			).toBe(2);
		});

		test("Matches a case with a computable (function) value", () => {
			const value = "B" as "A" | "B";
			const b = mock(() => "computed-b");

			expect(
				match(value, {
					A: "a",
					B: b,
				}),
			).toBe("computed-b");

			expect(b).toBeCalledTimes(1);
		});

		test("Only computes the matched case, not the others", () => {
			const value = "B" as "A" | "B" | "C";
			const a = mock(() => "a");
			const b = mock(() => "b");
			const c = mock(() => "c");

			match(value, {
				A: a,
				B: b,
				C: c,
			});

			expect(a).toBeCalledTimes(0);
			expect(b).toBeCalledTimes(1);
			expect(c).toBeCalledTimes(0);
		});
	});

	describe("Number target", () => {
		test("Matches an integer key", () => {
			const value = 1 as 0 | 1 | 2;

			expect(
				match(value, {
					0: "zero",
					1: "one",
					2: "two",
				}),
			).toBe("one");
		});

		test("Matches a negative and decimal key", () => {
			const value = -1.5 as -1.5 | 0;

			expect(
				match(value, {
					"-1.5": "negative",
					0: "zero",
				}),
			).toBe("negative");
		});
	});

	describe("Boolean target", () => {
		test("Matches true", () => {
			const value = true as boolean;

			expect(
				match(value, {
					true: "yes",
					false: "no",
				}),
			).toBe("yes");
		});

		test("Matches false", () => {
			const value = false as boolean;

			expect(
				match(value, {
					true: "yes",
					false: "no",
				}),
			).toBe("no");
		});
	});

	describe("Bigint target", () => {
		test("Matches a bigint key", () => {
			const value = 10n as 10n | 20n;

			expect(
				match(value, {
					10: "ten",
					20: "twenty",
				}),
			).toBe("ten");
		});
	});

	describe("Null and undefined targets", () => {
		test("Matches undefined via the 'undefined' key", () => {
			const value = undefined as string | undefined;

			expect(
				match(value, {
					undefined: "was-undefined",
					foo: "was-foo",
				}),
			).toBe("was-undefined");
		});

		test("Matches null via the 'null' key", () => {
			const value = null as string | null;

			expect(
				match(value, {
					null: "was-null",
					undefined: "was-undefined",
				}),
			).toBe("was-null");
		});
	});

	describe("No matching case", () => {
		test("Returns undefined when no fallback is given", () => {
			const value = "D" as "A" | "B" | "D";

			expect(
				match(value, {
					A: 1,
					B: 2,
				}),
			).toBeUndefined();
		});

		test("Returns a literal fallback value", () => {
			const value = "D" as "A" | "B" | "D";

			expect(
				match(
					value,
					{
						A: 1,
						B: 2,
					},
					"fallback",
				),
			).toBe("fallback");
		});

		test("Returns the result of a fallback function", () => {
			const value = "D" as "A" | "B" | "D";
			const fallback = mock((key: string) => `no-match:${key}`);

			expect(
				match(
					value,
					{
						A: 1,
						B: 2,
					},
					fallback,
				),
			).toBe("no-match:D");
			expect(fallback).toBeCalledTimes(1);
			expect(fallback.mock.calls[0]?.[0]).toBe("D");
		});

		test("Does not invoke the fallback function when a case matches", () => {
			const value = "A" as "A" | "B";
			const fallback = mock(() => "fallback");

			expect(
				match(
					value,
					{
						A: "matched",
						B: "not-matched",
					},
					fallback,
				),
			).toBe("matched");
			expect(fallback).toBeCalledTimes(0);
		});
	});

	describe("Caveat: a matched case can still resolve to undefined", () => {
		test("A case explicitly mapped to undefined returns undefined instead of falling back", () => {
			const value = "A" as "A" | "B";

			expect(
				match(
					value,
					{
						A: undefined,
						B: "b",
					},
					"fallback",
				),
			).toBeUndefined();
		});

		test("A case computing to undefined returns undefined instead of falling back", () => {
			const value = "A" as "A" | "B";

			expect(
				match(
					value,
					{
						A: () => undefined,
						B: "b",
					},
					"fallback",
				),
			).toBeUndefined();
		});
	});
});
