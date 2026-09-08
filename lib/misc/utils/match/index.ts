import { type Computable, compute, isComputation } from "../compute";

export type MatchTarget = string | number | boolean | bigint | null | undefined;

export type MatchClause<T extends MatchTarget> = Partial<Record<`${T}`, Computable<unknown>>>;

type ComputedValue<C> = C extends Computable<infer V> ? V : never;

/**
 * Matches a value to a clause that return a value
 * and returns a fallback if none of the cases match.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {MatchTarget} T
 * @template {MatchClause<T>} C
 * @template F
 * @param value The target value to match
 * @param clause Clause cases to check `value` against
 * @param fallback A fallback if no case in `clause` matches
 * @returns {ComputedValue<C[keyof C]> | F | undefined}
 */
export function match<const T extends MatchTarget, const C extends Required<MatchClause<T>>>(
	value: T,
	clause: C,
): ComputedValue<C[keyof C]>;
export function match<const T extends MatchTarget, const C extends MatchClause<T>>(
	value: T,
	clause: C,
): ComputedValue<C[keyof C]> | undefined;
export function match<const T extends MatchTarget, const C extends MatchClause<T>, const F>(
	value: T,
	clause: C,
	fallback: Computable<F, [value: `${Exclude<T, keyof C>}`]>,
): ComputedValue<C[keyof C]> | F;
export function match<const T extends MatchTarget, const C extends MatchClause<T>, const F>(
	value: T,
	clause: C,
	fallback?: Computable<F, [value: `${Exclude<T, keyof C>}`]>,
): ComputedValue<C[keyof C]> | F | undefined {
	const key = String(value) as `${T}`;

	if (key in clause) {
		return compute(clause[key]) as ComputedValue<C[keyof C]>;
	}

	if (isComputation(fallback)) {
		return fallback(key as `${Exclude<T, keyof C>}`);
	}

	return fallback;
}
