import { IMiddleware } from './interfaces';
/**
 * Creates a middleware which will be run
 * only when the pubEvent matches the given
 * pattern
 *
 * @param pattern Subscription event
 * @param middleware Middleware subscribed on the pattern
 */
export default function patternHandler(pattern: string, middleware: IMiddleware): IMiddleware;
