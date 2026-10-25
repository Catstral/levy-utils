import { beforeEach, describe, expect, mock, test } from "bun:test";
import { chain } from ".";

describe("chain", () => {
	beforeEach(() => {
		chain.config.reset();
	});

	test("No callbacks", () => {
		expect(chain()).toBeUndefined();
	});

	test("Single callback", () => {
		const result = chain(() => "foo");

		expect(result).toBe("foo");
	});

	test("Single callback receives undefined", () => {
		const fn = mock((value: unknown) => value);

		chain(fn);

		expect(fn).toBeCalledTimes(1);
		expect(fn).toBeCalledWith(undefined);
	});

	test("Multiple callbacks chain the return value", () => {
		const result = chain(
			() => 1,
			(value: number) => value + 1,
			(value: number) => value * 2,
		);

		expect(result).toBe(4);
	});

	test("Multiple callbacks pass the previous value in order", () => {
		const second = mock((value: boolean) => (value ? "true" : "false"));
		const third = mock((value: string) => value.toUpperCase());

		const result = chain(() => true, second, third);

		expect(second).toBeCalledTimes(1);
		expect(second).toBeCalledWith(true);

		expect(third).toBeCalledTimes(1);
		expect(third).toBeCalledWith("true");

		expect(result).toBe("TRUE");
	});

	test("Callbacks are called in order", () => {
		const order: number[] = [];

		chain(
			() => order.push(1),
			() => order.push(2),
			() => order.push(3),
		);

		expect(order).toEqual([1, 2, 3]);
	});

	test("Returns the result of the final callback", () => {
		const result = chain(
			() => "foo",
			() => "bar",
			() => "baz",
		);

		expect(result).toBe("baz");
	});
});
