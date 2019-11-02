/**
 * This error will be thrown when an invalid wildcards sequence
 * is detected
 */
export class InvalidPatternError extends Error {
  constructor() {
    super('DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/');

    this.name = this.constructor.name;
  }
}
