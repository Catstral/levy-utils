/**
 * Presets the parameters of a callback with a callback that computes its arguments.
 *
 * The time complexity for this is `O(1)`.
 *
 * @template {(...args: never[]) => unknown} T
 * @template {unknown[]} [Args=never[]]
 * @template {Parameters<T>} [Params=Parameters<T>]
 * @param {T} callback The callback to preset the parameters for
 * @param {Computable<Params, Args>} parameters The parameters or callback that computes parameters to preset
 * @returns {(...args: Args) => ReturnType<T>} A callback that runs the input `callback` with the preset parameters
 */
export function preset<const T extends (...args: never[]) => unknown, const Args extends unknown[] = never[]>(
	callback: T,
	parameters: (...args: Args) => Parameters<T>,
): (...args: Args) => ReturnType<T> {
	return (...args: Args): ReturnType<T> => {
		const params = parameters(...args);

		return callback(...params) as ReturnType<T>;
	};
}
