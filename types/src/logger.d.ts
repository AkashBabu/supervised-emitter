declare enum LEVEL {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Custom Logger with different log levels
 * and enable/disable logging
 */
export default class Logger {
    private level;
    private printMsg;
    static LEVEL: typeof LEVEL;
    private prefix;
    constructor(level?: LEVEL, printMsg?: boolean);
    /**
     * Prints debug messages to console
     * @param args Log msgs
     */
    debug(...args: any[]): void;
    /**
     * Prints info messages to console
     * @param args Log msgs
     */
    info(...args: any[]): void;
    /**
     * Prints warn messages to console
     * @param args Log msgs
     */
    warn(...args: any[]): void;
    /**
     * Prints error messages to console
     * @param args Log msgs
     */
    error(...args: any[]): void;
    /**
     * Enable writing logs to console
     */
    enable(): void;
    /**
     * Disable writing logs to console
     */
    disable(): void;
    /**
     * Adds this prefix for every logged line
     * This is especially useful when the library
     * name has to be printed on each logged line
     *
     * @param prefix Prefix for every log
     */
    setPrefix(prefix: string): void;
    private log;
}
export {};
