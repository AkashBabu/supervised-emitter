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

/**
 * Thrown if SupervisedEmitter is initialized more than once
 */
export class SingletonError extends Error {
  constructor() {
    super('Can\'t initialize singleton => "SupervisedEmitter", more than once');

    this.name = this.constructor.name;
  }
}
