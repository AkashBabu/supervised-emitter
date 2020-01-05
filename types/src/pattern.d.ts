/**
 * Predicate that checks if any part of the
 * event is a wildcard or not
 *
 * @param event Event to check for wildcard
 *
 * @returns true if the given event contains
 *    wildcards
 */
export declare function isPatternEvent(event: string): boolean;
/**
 * Checks if the given event is valid
 *
 * @param event event to check
 *
 * @returns {Boolean}
 */
export declare function isValidEvent(event: string): boolean;
/**
 * Checks if the pubEvent matches the pattern event
 *
 * @param pubEvent Event to check for match
 * @param subEvent pattern subEvent
 *
 * @returns true if it matches
 *
 * @throws Invalid Pattern if it violates wildcard
 *     policies
 */
export declare function doesPatternMatch(pubEvent: string, subEvent: string): boolean;
/**
 * Sanitizes the given event by removing all
 * empty parts. If `getParts` is true, then it
 * returns all the non-empty parts as a list else
 * string
 *
 * @param event Event
 * @param getParts If true, then returns non-empty parts list
 *
 * @returns sanitized-event
 */
export declare function sanitizeEvent(event: string, getParts?: boolean): string | string[];
