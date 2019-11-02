"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const SEPERATOR = '/';
/**
 * Predicate that checks if the given
 * part is a wildcard part or not
 *
 * @param part Part of the event to check
 *
 * @returns {Boolean}
 */
function isWildcard(part) {
    return part === '*' || part === '**';
}
/**
 * Returns the parts of the event.
 * i.e, it essentially splits the event string
 * based on a seperator '/' and removes
 * the empty parts
 *
 * @param event Event
 *
 * @returns list of event parts
 */
const getEventParts = (event) => sanitizeEvent(event, true);
/**
 * Predicate that checks if any part of the
 * event is a wildcard or not
 *
 * @param event Event to check for wildcard
 *
 * @returns true if the given event contains
 *    wildcards
 */
function isPatternEvent(event) {
    return !!getEventParts(event).find(isWildcard);
}
exports.isPatternEvent = isPatternEvent;
/**
 * Checks if the given event is valid
 *
 * @param event event to check
 *
 * @returns {Boolean}
 */
function isValidEvent(event) {
    const eventParts = getEventParts(event);
    // let prevPart = eventParts[0];
    let prevPart = '';
    return !eventParts.some((eventPart) => {
        if (isWildcard(prevPart) && isWildcard(eventPart)) {
            // This essentially checks for */** or **/* or **/**
            if ((eventPart + prevPart).length > 2)
                return true;
        }
        prevPart = eventPart;
    });
}
exports.isValidEvent = isValidEvent;
/**
 * Closure that returns the next patterPart in the array
 *
 */
function arrayIterator(arr) {
    let index = -1;
    return (i) => {
        if (i)
            index = i + 1;
        else
            index++;
        return [arr[index], index];
    };
}
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
function doesPatternMatch(pubEvent, subEvent) {
    if (!isValidEvent(subEvent))
        throw new errors_1.InvalidPatternError();
    // Publish event parts
    const pubParts = getEventParts(pubEvent);
    const getNextPubPart = arrayIterator(pubParts);
    // Subscribe event parts
    const subParts = getEventParts(subEvent);
    const getNextSubPart = arrayIterator(subParts);
    /**
     * Checks if the parts matches post a '**'
     * if not then, checks for match from
     * the next eventPart index
     *
     * @param eventPart Event part in the form of
     *       [eventPart, eventIndex]
     * @param nextPatternIndex Next Pattern index
     *
     * @returns true if parts match after '**'
     */
    function checkMulti([eventPart, eventIndex], nextPatternIndex) {
        if (!eventPart)
            return false;
        const isMatch = match([eventPart, eventIndex], getNextSubPart(nextPatternIndex - 1));
        return !isMatch ? checkMulti(getNextPubPart(eventIndex), nextPatternIndex) : true;
    }
    function match([eventPart, eventIndex] = getNextPubPart(), [patternPart] = getNextSubPart()) {
        // if eventPart is present but not patternPart
        // or vice-versa then it's not a match
        if ((!eventPart && patternPart && patternPart !== '**') || (!patternPart && eventPart))
            return false;
        // if both parts are not present then
        // it's a match
        if (!eventPart && !patternPart)
            return true;
        // if it's not a pattern (*, **) then perform
        // a direct string match
        if (!isWildcard(patternPart)) {
            return patternPart === eventPart ? match() : false;
        }
        // Since * would match any string, goto next match;
        if (patternPart === '*')
            return match();
        // Else patternPart == '**'
        const [nextPatternPart, nextPatternIndex] = getNextSubPart();
        return nextPatternPart ? checkMulti([eventPart, eventIndex], nextPatternIndex) : true;
    }
    return match();
}
exports.doesPatternMatch = doesPatternMatch;
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
function sanitizeEvent(event, getParts) {
    const sanitizedEvent = [];
    let part = '';
    for (const char of event) {
        if (char === SEPERATOR) {
            if (part) {
                sanitizedEvent.push(part);
                part = '';
            }
        }
        else {
            part += char;
        }
    }
    // Check if there are any remaining characters
    // in `part`, if so then add them up
    if (part) {
        sanitizedEvent.push(part);
    }
    return getParts ? sanitizedEvent : sanitizedEvent.join(SEPERATOR);
}
exports.sanitizeEvent = sanitizeEvent;
//# sourceMappingURL=pattern.js.map