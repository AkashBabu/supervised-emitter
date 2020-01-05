export default function mergeOptions(givenOpts: any = {}, defaultOpts: any = {}) {
  return [...new Set([
    ...Object.keys(givenOpts),
    ...Object.keys(defaultOpts),
  ])].reduce((result: any, key) => {
    if (typeof givenOpts[key] === 'object') {
      result[key] = mergeOptions(givenOpts[key], defaultOpts[key]);
    } else {
      result[key] = givenOpts[key] !== undefined
        ? givenOpts[key]
        : defaultOpts[key];
    }

    return result;
  }, {});
}
