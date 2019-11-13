import { IHandler, IContext } from './interfaces';
/**
 * Returns all the keys in the Map
 *
 * @param map Map
 *
 * @returns List of keys in the given map
 */
export declare function getKeys(map: Map<string, boolean>): string[];
/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
export declare function pipe(...handlers: IHandler[]): (ctx: IContext, ...args: any[]) => Promise<any>;
