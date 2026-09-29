import type { Promisable } from "~/types";

/**
 * Executes the given callback in asynchronous context.
 *
 * If no callback is given, it yields execution to the microtask queue.
 *
 * The time complexity for this is `O(1)`.
 *
 * @param {() => Promisable<void>} [callback=(() => {})] An optional callback to execute
 * @returns {Promise<void>} A Promise that resolves after the callback has completed or execution has yielded to the microtask queue
 */
export async function task(callback: () => Promisable<void> = () => {}): Promise<void> {
	await callback();
}
