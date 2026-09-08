import { type Computable, compute, isComputation } from "../compute";

export type MatchTarget = string | number | boolean | bigint | null | undefined;

export type MatchCases<T extends MatchTarget> = Partial<Record<`${T}`, Computable<unknown>>>;

type ComputedValue<C> = C extends Computable<infer V> ? V : never;

export function match<const T extends MatchTarget, const C extends Required<MatchCases<T>>>(
	value: T,
	cases: C,
): ComputedValue<C[keyof C]>;
export function match<const T extends MatchTarget, const C extends MatchCases<T>>(
	value: T,
	cases: C,
): ComputedValue<C[keyof C]> | undefined;
export function match<const T extends MatchTarget, const C extends MatchCases<T>, const F>(
	value: T,
	cases: C,
	fallback: Computable<F, [value: `${Exclude<T, keyof C>}`]>,
): ComputedValue<C[keyof C]> | F;
export function match<const T extends MatchTarget, const C extends MatchCases<T>, const F>(
	value: T,
	cases: C,
	fallback?: Computable<F, [value: `${Exclude<T, keyof C>}`]>,
): ComputedValue<C[keyof C]> | F | undefined {
	const key = String(value) as `${T}`;

	if (key in cases) {
		return compute(cases[key]) as ComputedValue<C[keyof C]>;
	}

	if (isComputation(fallback)) {
		return fallback(key as `${Exclude<T, keyof C>}`);
	}

	return fallback;
}
