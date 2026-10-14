import { describe, expect, mock, test } from "bun:test";
import { SelectUtilError, select } from ".";

describe("select", () => {
	test("Discard leaves every item out", () => {
		const selected = select([1, 2, 3], ({ discard }) => discard());

		expect(selected).toBeArrayOfSize(0);
	});

	test("Keep adds every item as-is", () => {
		const selected = select([1, 2, 3], ({ keep }) => keep());

		expect(selected).toEqual([1, 2, 3]);
	});

	test("Filter keeps only the items that pass", () => {
		const selected = select([1, 2, 3, 4, 5], ({ item, filter }) => filter(item % 2 === 1));

		expect(selected).toEqual([1, 3, 5]);
	});

	test("Map adds the given value in place of the item", () => {
		const selected = select([1, 2, 3], ({ item, map }) => map(item * 2));

		expect(selected).toEqual([2, 4, 6]);
	});

	test("Map can convert to a different type", () => {
		const selected = select<number, string>([1, 2, 3], ({ item, map }) => map(`foo-${item}`));

		expect(selected).toEqual(["foo-1", "foo-2", "foo-3"]);
	});

	test("Flat adds every value of the given list in place of the item", () => {
		const selected = select([1, 2], ({ item, flat }) => flat([item, item * 10]));

		expect(selected).toEqual([1, 10, 2, 20]);
	});

	test("Spread adds every given value in place of the item", () => {
		const selected = select([1, 2], ({ item, spread }) => spread(item, item * 10));

		expect(selected).toEqual([1, 10, 2, 20]);
	});

	test("Flat with an empty list behaves like discard", () => {
		const selected = select([1, 2, 3], ({ flat }) => flat([]));

		expect(selected).toBeArrayOfSize(0);
	});

	test("Spread without values behaves like discard", () => {
		const selected = select([1, 2, 3], ({ spread }) => spread());

		expect(selected).toBeArrayOfSize(0);
	});

	test("Actions can be mixed per item", () => {
		const selected = select([1, 2, 3, 4, 5], ({ item, discard, keep, map, spread }) => {
			switch (item) {
				case 1: {
					return keep();
				}
				case 2: {
					return discard();
				}
				case 3: {
					return map(30);
				}
				case 4: {
					return spread(4, 4);
				}
				default: {
					return discard();
				}
			}
		});

		expect(selected).toEqual([1, 30, 4, 4]);
	});

	test("Context exposes the item, index and original list", () => {
		const list = ["foo", "bar", "baz"];
		const items: string[] = [];
		const indices: number[] = [];

		select(list, ({ item, index, list: original, keep }) => {
			items.push(item);
			indices.push(index);

			expect(original).toBe(list);

			return keep();
		});

		expect(items).toEqual(["foo", "bar", "baz"]);
		expect(indices).toEqual([0, 1, 2]);
	});

	test("Empty list", () => {
		const callback = mock(() => {});

		const selected = select([] as number[], ({ keep }) => {
			callback();

			return keep();
		});

		expect(selected).toBeArrayOfSize(0);
		expect(callback).not.toHaveBeenCalled();
	});

	test("Preserves order of the original list", () => {
		const selected = select([5, 4, 3, 2, 1], ({ item, filter }) => filter(item !== 3));

		expect(selected).toEqual([5, 4, 2, 1]);
	});

	test("Does not mutate the input list", () => {
		const list = [1, 2, 3];

		select(list, ({ item, spread }) => spread(item, item));

		expect(list).toEqual([1, 2, 3]);
	});

	test("Does not mutate the list passed to flat", () => {
		const values = [1, 2];

		const selected = select([0], ({ flat }) => flat(values));

		selected.push(3);

		expect(values).toEqual([1, 2]);
	});

	test("An unknown action throws a SelectUtilError", () => {
		try {
			select([1], () => ({ type: "UNKNOWN" }) as never);
			expect().fail("Unknown action passed selection");
		} catch (err) {
			expect(err).toBeInstanceOf(SelectUtilError);
			expect((err as SelectUtilError).util).toBe("select");
			expect((err as Error).message).toBe("Invalid action type: UNKNOWN");
		}
	});
});
