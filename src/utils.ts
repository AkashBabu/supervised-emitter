import { IHandler, IContext } from './index';

/**
 * Composes the list of functions passed.
 *
 * @param  handlers List of handlers
 *
 * @returns function(x) : y
 */
function compose(...handlers: IHandler[]) {
  return composer('reduceRight', ...handlers);
}

/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
function pipe(...handlers: IHandler[]) {
  return composer('reduce', ...handlers);
}

/**
 * You may create a pipe | compose based
 * on the array method sent
 *
 * @param method Array method to be called
 * @param handlers list of functions
 *
 * @returns Composed function
 */
function composer(method: 'reduce' | 'reduceRight', ...handlers: IHandler[]) {
  return (ctx: IContext, ...args: any[]) => {
    let hasEnded = false;
    const end = (data: any) => {
      hasEnded = true;
      return data;
    };

    ctx.end = end;

    return handlers[method](async (prev: Promise<any>, handler: IHandler) => {
      ctx.data = await prev;

      // If the pipeline has ended then
      // do not call further handlers
      if (hasEnded) return ctx.data;

      return handler(ctx, ...args);
    }, ctx.data);
  };
}

/**
 * Returns all the keys in the map
 *
 * @param map Map
 *
 * @returns List of keys in the given map
 */
function getKeys(map: Map<string, boolean>) {
  const keys: string[] = [];

  const keysIter = map.keys();
  let key = keysIter.next();
  while (!key.done) {
    keys.push(key.value);
    key = keysIter.next();
  }

  return keys;
}

export { compose, pipe, getKeys };
