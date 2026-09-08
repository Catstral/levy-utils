import { describe, expect, mock, test } from "bun:test";
import { compose } from ".";

describe.concurrent("compose", () => {
	test.concurrent("No callbacks", () => {
		const composed = compose();

		expect(composed()).toBeUndefined();
	});

	test.concurrent("Single callback", () => {
		const composed = compose(() => "foo");

		expect(composed()).toBe("foo");
	});

	test.concurrent("Single callback receives the composed arguments", () => {
		const fn = mock((value: number) => value);

		const composed = compose(fn);

		composed(42);

		expect(fn).toBeCalledTimes(1);
		expect(fn).toBeCalledWith(42);
	});

	test.concurrent("Multiple callbacks chain the return value", () => {
		const composed = compose(
			(value: number) => value + 1,
			(value: number) => value * 2,
		);

		expect(composed(1)).toBe(4);
	});

	test.concurrent("Multiple callbacks pass the previous value in order", () => {
		const second = mock((value: boolean) => (value ? "true" : "false"));
		const third = mock((value: string) => value.toUpperCase());

		const composed = compose((value: boolean) => value, second, third);

		const result = composed(true);

		expect(second).toBeCalledTimes(1);
		expect(second).toBeCalledWith(true);

		expect(third).toBeCalledTimes(1);
		expect(third).toBeCalledWith("true");

		expect(result).toBe("TRUE");
	});

	test.concurrent("Callbacks are called in order", () => {
		const order: number[] = [];

		const composed = compose(
			() => order.push(1),
			() => order.push(2),
			() => order.push(3),
		);

		composed();

		expect(order).toEqual([1, 2, 3]);
	});

	test.concurrent("Returns the result of the final callback", () => {
		const composed = compose(
			() => "foo",
			() => "bar",
			() => "baz",
		);

		expect(composed()).toBe("baz");
	});

	test.concurrent("Returns a re-usable callback", () => {
		const fn = mock((value: number) => value * 2);

		const composed = compose(fn);

		expect(composed(1)).toBe(2);
		expect(composed(2)).toBe(4);
		expect(composed(3)).toBe(6);

		expect(fn).toBeCalledTimes(3);
	});
});
