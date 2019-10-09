"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0; /* istanbul ignore file */
/* eslint-disable no-console */

var LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3 };


function Logger() {var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : LEVEL.DEBUG;var printMsg = arguments.length > 1 ? arguments[1] : undefined;
  var prefix = '';

  function log(logLevel) {
    return logLevel >= level && printMsg ?
    function () {
      var print = console.log;
      if (level === LEVEL.WARN) print = console.warn;
      if (level === LEVEL.ERROR) print = console.error;for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}

      print.apply(void 0, [prefix].concat(args));
    } :
    function () {};
  }

  return {
    debug: log(LEVEL.DEBUG),
    info: log(LEVEL.INFO),
    warn: log(LEVEL.WARN),
    error: log(LEVEL.ERROR),
    enable: function enable() {return printMsg = true;},
    disable: function disable() {return printMsg = false;},
    setPrefix: function setPrefix(badge) {return prefix = badge;} };

}

Logger.LEVEL = LEVEL;var _default =

Logger;exports["default"] = _default;