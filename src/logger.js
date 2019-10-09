/* istanbul ignore file */
/* eslint-disable no-console */

const LEVEL = {
  DEBUG : 0,
  INFO  : 1,
  WARN  : 2,
  ERROR : 3,
};

function Logger(level = LEVEL.DEBUG, printMsg) {
  let prefix = '';

  function log(logLevel) {
    return logLevel >= level && printMsg
      ? (...args) => {
        let print = console.log;
        if (level === LEVEL.WARN) print = console.warn;
        if (level === LEVEL.ERROR) print = console.error;

        print(prefix, ...args);
      }
      : () => {};
  }

  return {
    debug     : log(LEVEL.DEBUG),
    info      : log(LEVEL.INFO),
    warn      : log(LEVEL.WARN),
    error     : log(LEVEL.ERROR),
    enable    : () => printMsg = true,
    disable   : () => printMsg = false,
    setPrefix : badge => prefix = badge,
  };
}

Logger.LEVEL = LEVEL;

export default Logger;
