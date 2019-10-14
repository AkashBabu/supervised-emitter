import { IHandler, IContext } from './index';
/**
 * Composes the list of functions passed.
 *
 * @param  handlers List of handlers
 *
 * @returns function(x) : y
 */
declare function compose(...handlers: IHandler[]): (ctx: IContext, ...args: any[]) => Promise<any>;
/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
declare function pipe(...handlers: IHandler[]): (ctx: IContext, ...args: any[]) => Promise<any>;
/**
 * Returns all the keys in the map
 *
 * @param map Map
 *
 * @returns List of keys in the given map
 */
declare function getKeys(map: Map<string, boolean>): string[];
export { compose, pipe, getKeys };
