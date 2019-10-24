"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["DEBUG"] = 0] = "DEBUG";
    LEVEL[LEVEL["INFO"] = 1] = "INFO";
    LEVEL[LEVEL["WARN"] = 2] = "WARN";
    LEVEL[LEVEL["ERROR"] = 3] = "ERROR";
})(LEVEL || (LEVEL = {}));
/**
 * Custom Logger with different log levels
 * and enable/disable logging
 */
class Logger {
    constructor(level = LEVEL.DEBUG, printMsg = false) {
        this.level = level;
        this.printMsg = printMsg;
        this.prefix = '';
    }
    /**
     * Prints debug messages to console
     * @param args Log msgs
     */
    debug(...args) {
        this.log(LEVEL.DEBUG, ...args);
    }
    /**
     * Prints info messages to console
     * @param args Log msgs
     */
    info(...args) {
        return this.log(LEVEL.INFO, ...args);
    }
    /**
     * Prints warn messages to console
     * @param args Log msgs
     */
    warn(...args) {
        return this.log(LEVEL.WARN, ...args);
    }
    /**
     * Prints error messages to console
     * @param args Log msgs
     */
    error(...args) {
        return this.log(LEVEL.ERROR, ...args);
    }
    /**
     * Enable writing logs to console
     */
    enable() {
        this.printMsg = true;
    }
    /**
     * Disable writing logs to console
     */
    disable() {
        this.printMsg = false;
    }
    /**
     * Adds this prefix for every logged line
     * This is especially useful when the library
     * name has to be printed on each logged line
     *
     * @param prefix Prefix for every log
     */
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    log(logLevel, ...args) {
        if ((logLevel < this.level) && this.printMsg) {
            let print = console.log;
            if (this.level === LEVEL.WARN) {
                print = console.warn;
            }
            else if (this.level === LEVEL.ERROR) {
                print = console.error;
            }
            print(this.prefix, ...args);
        }
    }
}
exports.default = Logger;
Logger.LEVEL = LEVEL;
//# sourceMappingURL=logger.js.map