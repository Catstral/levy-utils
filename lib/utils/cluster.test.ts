import { describe, expect, test } from "bun:test";
import { UtilError } from "../error";
import { cluster } from "./cluster";

describe("cluster", () => {
	test("5 length, 2 size", () => {
		const clustered = cluster([0, 1, 2, 3, 4], 2);

		expect(clustered).toBeArrayOfSize(3);

		expect(clustered[0]).toBeArrayOfSize(2);
		expect(clustered[0]).toContain(0);
		expect(clustered[0]).toContain(1);

		expect(clustered[1]).toBeArrayOfSize(2);
		expect(clustered[1]).toContain(2);
		expect(clustered[1]).toContain(3);

		expect(clustered[2]).toBeArrayOfSize(1);
		expect(clustered[2]).toContain(4);
	});

	test("2 length, 5 size", () => {
		const clustered = cluster([0, 1], 5);

		expect(clustered).toBeArrayOfSize(1);

		expect(clustered[0]).toBeArrayOfSize(2);
		expect(clustered[0]).toContain(0);
		expect(clustered[0]).toContain(1);
	});

	test("Invalid size definition", () => {
		try {
			cluster([0, 1, 2, 3, 4], 0);
			expect().fail("Invalid size definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(UtilError);

			const error = err as UtilError;

			expect(error.util).toBe("cluster");
		}
	});

	test("Invalid items definition", () => {
		try {
			cluster("" as unknown as string[], 1);
			expect().fail("Invalid item definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(UtilError);

			const error = err as UtilError;

			expect(error.util).toBe("cluster");
		}
	});
});
