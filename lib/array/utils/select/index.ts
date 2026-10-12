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
interface SelectSpreadOperation<R> {
	$type: "SPREAD";
	value: R;
}

/**
 * @private
 */
type SelectOperation<R = unknown> = SelectDiscardOperation | SelectMapOperation<R> | SelectSpreadOperation<R>;

export interface SelectContext<T, R = unknown> {
	value: T;
	index: number;
	list: readonly T[];
	discard(): SelectDiscardOperation;
	keep(value: R): SelectMapOperation<R>;
	spread(values: R): SelectMapOperation<R>;
}

export type SelectCallback<T, R> = (context: SelectContext<T, R>) => NoInfer<SelectOperation<R>> | boolean;

export function select<const T, const R>(list: readonly T[], callback: SelectCallback<T, R>): R[];
export function select<const T, const R>(list: readonly T[], callback: SelectCallback<T, R>): R[] {
	return [];
}
