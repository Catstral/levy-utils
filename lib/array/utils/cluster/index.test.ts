import { describe, expect, test } from "bun:test";
import { ClusterUtilError, cluster } from ".";

describe("cluster", () => {
	test("Splits a 5-item list into clusters of at most 2", () => {
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

	test("A list shorter than the cluster size returns a single cluster", () => {
		const clustered = cluster([0, 1], 5);

		expect(clustered).toBeArrayOfSize(1);

		expect(clustered[0]).toBeArrayOfSize(2);
		expect(clustered[0]).toContain(0);
		expect(clustered[0]).toContain(1);
	});

	test("A size of 0 throws a ClusterUtilError", () => {
		try {
			cluster([0, 1, 2, 3, 4], 0);
			expect().fail("Invalid size definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(ClusterUtilError);
			expect((err as ClusterUtilError).util).toBe("cluster");
			expect((err as ClusterUtilError).message).toBe("Cluster size cannot be smaller than 1");
		}
	});

	test("Non-array items throws a ClusterUtilError", () => {
		try {
			cluster("" as unknown as string[], 1);
			expect().fail("Invalid item definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(ClusterUtilError);
			expect((err as ClusterUtilError).util).toBe("cluster");
			expect((err as ClusterUtilError).message).toBe("Items must be an array");
		}
	});

	test("Null items throws a ClusterUtilError", () => {
		try {
			cluster(null as unknown as number[], 1);
			expect().fail("Null item definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(ClusterUtilError);
			expect((err as ClusterUtilError).util).toBe("cluster");
			expect((err as ClusterUtilError).message).toBe("Items must be an array");
		}
	});

	test("A negative size throws a ClusterUtilError", () => {
		try {
			cluster([0, 1], -1);
			expect().fail("Negative size definition passed clustering");
		} catch (err) {
			expect(err).toBeInstanceOf(ClusterUtilError);
			expect((err as ClusterUtilError).util).toBe("cluster");
			expect((err as ClusterUtilError).message).toBe("Cluster size cannot be smaller than 1");
		}
	});

	test("Empty items list", () => {
		const clustered = cluster([], 3);

		expect(clustered).toBeArrayOfSize(1);
		expect(clustered[0]).toBeArrayOfSize(0);
	});

	test("Length is an exact multiple of size", () => {
		const clustered = cluster([0, 1, 2, 3], 2);

		expect(clustered).toBeArrayOfSize(2);
		expect(clustered[0]).toEqual([0, 1]);
		expect(clustered[1]).toEqual([2, 3]);
	});

	test("Size of 1 puts every item in its own cluster", () => {
		const clustered = cluster([0, 1, 2], 1);

		expect(clustered).toBeArrayOfSize(3);
		expect(clustered[0]).toEqual([0]);
		expect(clustered[1]).toEqual([1]);
		expect(clustered[2]).toEqual([2]);
	});
});
