"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This error will be thrown when an invalid wildcards sequence
 * is detected
 */
class InvalidPatternError extends Error {
    constructor() {
        super('DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/');
        this.name = this.constructor.name;
    }
}
exports.InvalidPatternError = InvalidPatternError;
/**
 * Thrown if SupervisedEmitter is initialized more than once
 */
class SingletonError extends Error {
    constructor() {
        super('Can\'t initialize singleton => "SupervisedEmitter", more than once');
        this.name = this.constructor.name;
    }
}
exports.SingletonError = SingletonError;
//# sourceMappingURL=errors.js.map