import { IHandler, IContext } from '../interfaces';

// /**
//  * Composes the list of functions passed.
//  *
//  * @param  handlers List of handlers
//  *
//  * @returns function(x) : y
//  */
// export function compose(...handlers: IHandler[]) {
//   return composer('reduceRight', ...handlers);
// }

/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
export function pipe(...handlers: IHandler[]) {
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
function composer(method: 'reduce' | 'reduceRight', ...handlers: IHandler[]): IHandler {
  return (ctx: IContext, ...args: any[]): Promise<any> => {
    let hasEnded = false;

    ctx.pipelinePromise = handlers[method](async (prev: Promise<any>, handler: IHandler) => {
      // If the pipeline has ended then
      // do not call further handlers
      if (hasEnded) return;

      const result = await prev;

      // End the pipeline if any handler
      // hasn't returned anything.
      if (result === undefined) {
        hasEnded = true;
        return;
      }

      ctx.data = result;

      return handler(ctx, ...args);
    }, ctx.data);

    return ctx.pipelinePromise;
  };
}
