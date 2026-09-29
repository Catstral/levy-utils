import { describe, expect, test } from "bun:test";
import { isPrime } from ".";

describe("isPrime", () => {
	test("Prime numbers", () => {
		expect(isPrime(2)).toBe(true);
		expect(isPrime(3)).toBe(true);
		expect(isPrime(5)).toBe(true);
		expect(isPrime(7)).toBe(true);
		expect(isPrime(11)).toBe(true);
		expect(isPrime(13)).toBe(true);
		expect(isPrime(17)).toBe(true);
		expect(isPrime(19)).toBe(true);
		expect(isPrime(23)).toBe(true);
		expect(isPrime(29)).toBe(true);
	});

	test("Composite numbers", () => {
		expect(isPrime(4)).toBe(false);
		expect(isPrime(6)).toBe(false);
		expect(isPrime(8)).toBe(false);
		expect(isPrime(9)).toBe(false);
		expect(isPrime(10)).toBe(false);
		expect(isPrime(12)).toBe(false);
		expect(isPrime(15)).toBe(false);
		expect(isPrime(21)).toBe(false);
		expect(isPrime(25)).toBe(false);
		expect(isPrime(27)).toBe(false);
	});

	test("Numbers less than or equal to one", () => {
		expect(isPrime(1)).toBe(false);
		expect(isPrime(0)).toBe(false);
		expect(isPrime(-1)).toBe(false);
		expect(isPrime(-2)).toBe(false);
		expect(isPrime(-10)).toBe(false);
	});

	test("Non-integer numbers", () => {
		expect(isPrime(2.5)).toBe(false);
		expect(isPrime(3.14)).toBe(false);
		expect(isPrime(5.5)).toBe(false);
		expect(isPrime(-2.5)).toBe(false);
	});

	test("Special numeric values", () => {
		expect(isPrime(NaN)).toBe(false);
		expect(isPrime(Infinity)).toBe(false);
		expect(isPrime(-Infinity)).toBe(false);
	});

	test("Larger prime numbers", () => {
		expect(isPrime(97)).toBe(true);
		expect(isPrime(101)).toBe(true);
		expect(isPrime(997)).toBe(true);
	});

	test("Larger composite numbers", () => {
		expect(isPrime(100)).toBe(false);
		expect(isPrime(121)).toBe(false);
		expect(isPrime(999)).toBe(false);
	});
});
