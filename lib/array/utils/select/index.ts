/**
 * @private
 */
interface SelectDiscardOperation {
	$type: "DISCARD";
}

/**
 * @private
 */
interface SelectMapOperation<R> {
	$type: "MAP";
	value: R;
}

/**
 * @private
 */
interface SelectFlatOperation<R> {
	$type: "FLAT";
	value: R;
}

/**
 * @private
 */
interface SelectSpreadOperation<R> {
	$type: "SPREAD";
	value: R;
}

/**
 * @private
 */
type SelectOperation<R = unknown> =
	| SelectDiscardOperation
	| SelectMapOperation<R>
	| SelectSpreadOperation<R>
	| SelectFlatOperation<R>;

export interface SelectContext<T, R = unknown> {
	value: T;
	index: number;
	list: readonly T[];
	discard(): SelectDiscardOperation;
	map(value: R): SelectMapOperation<R>;
	flat(values: R[]): SelectMapOperation<R>;
	spread(...values: R[]): SelectMapOperation<R>;
}

export type SelectCallback<T, R> = (context: SelectContext<T, R>) => NoInfer<SelectOperation<R>>;

export function select<const T, const R>(list: readonly T[], callback: SelectCallback<T, R>): R[];
export function select<const T, const R>(list: readonly T[], callback: SelectCallback<T, R>): R[] {
	return [];
}

select([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], ({ value, discard }) => {
	return;
});
