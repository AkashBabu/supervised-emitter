/* istanbul ignore file */

enum LEVEL { DEBUG, INFO, WARN, ERROR }

/**
 * Custom Logger with different log levels
 * and enable/disable logging
 */
export default class Logger {
  public static LEVEL = LEVEL;
  private prefix: string = '';

  constructor(private level: LEVEL = LEVEL.DEBUG, private printMsg: boolean = false) {
  }

  /**
   * Prints debug messages to console
   * @param args Log msgs
   */
  public debug(...args: any[]) {
    this.log(LEVEL.DEBUG, ...args);
  }

  /**
   * Prints info messages to console
   * @param args Log msgs
   */
  public info(...args: any[]) {
    return this.log(LEVEL.INFO, ...args);
  }

  /**
   * Prints warn messages to console
   * @param args Log msgs
   */
  public warn(...args: any[]) {
    return this.log(LEVEL.WARN, ...args);
  }

  /**
   * Prints error messages to console
   * @param args Log msgs
   */
  public error(...args: any[]) {
    return this.log(LEVEL.ERROR, ...args);
  }

  /**
   * Enable writing logs to console
   */
  public enable() {
    this.printMsg = true;
  }

  /**
   * Disable writing logs to console
   */
  public disable() {
    this.printMsg = false;
  }

  /**
   * Adds this prefix for every logged line
   * This is especially useful when the library
   * name has to be printed on each logged line
   *
   * @param prefix Prefix for every log
   */
  public setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  private log(logLevel: LEVEL, ...args: any[]): void {
    if ((logLevel < this.level) && this.printMsg) {
      let print;
      if (this.level === LEVEL.WARN) {
        print = console.warn; // tslint-disable-line
      } else if (this.level === LEVEL.ERROR) {
        print = console.error;
      } else {
        print = console.log;
      }

      print(this.prefix, ...args);
    }
  }
}
