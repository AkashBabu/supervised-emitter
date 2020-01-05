import { IHandler } from '../interfaces';
/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
export declare function pipe(...handlers: IHandler[]): IHandler;
