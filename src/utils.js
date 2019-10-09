/**
 * Composes the list of functions passed.
 *
 * @param  {...function} fns List of functions to be composed
 *
 * @returns function(x) : y
 */
function compose(...fns) {
  return composer('reduceRight', ...fns);
}

/**
 * Pipes the list of functions passed
 * @param  {...function} fns List of functions
 *
 * @returns function(x) : y
 */
function pipe(...fns) {
  return composer('reduce', ...fns);
}


/**
 * You may create a pipe | compose based
 * on the array method sent
 *
 * @param {String} method Array method to be called
 * @param  {...function} fns list of functions
 *
 * @returns {(x, ...args) => y}
 */
function composer(method, ...fns) {
  return (ctx, ...args) => {
    let hasEnded = false;
    const end = data => {
      hasEnded = true;
      return data;
    };

    ctx.end = end;

    return fns[method](async (y, fn) => {
      ctx.data = await y;

      // if the pipeline has ended then
      // do not call further handlers
      if (hasEnded) return ctx.data;

      return fn(ctx, ...args);
    }, ctx.data);
  };
}


/**
 * Returns all the keys in the map
 *
 * @param {Map} map Map
 *
 * @returns {String[]} key list
 */
function getKeys(map) {
  const keys = [];
  const keysIter = map.keys();
  let key = keysIter.next();
  while (!key.done) {
    keys.push(key.value);
    key = keysIter.next();
  }

  return keys;
}

export { compose, pipe, getKeys };
