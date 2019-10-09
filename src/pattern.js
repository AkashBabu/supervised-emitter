/* eslint complexity: [error, 12] */

import { InvalidPatternError } from './errors';

const SEPERATOR = '/';

/**
 * Predicate that checks if the given
 * part is a wildcard part or not
 *
 * @param {String} part Part of the event to check
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
 * @param {String} event Event
 *
 * @returns {String[]} list of event parts
 */
const getEventParts = event => sanitizeEvent(event, true);


/**
 * Predicate that checks if any part of the
 * event is a wildcard or not
 *
 * @param {String} event Event to check for wildcard
 *
 * @returns {Boolean}
 */
export function isPatternEvent(event) {
  return getEventParts(event).find(isWildcard);
}


/**
 * Checks if the given event is valid
 *
 * @param {String} event event to check
 *
 * @returns {Boolean}
 */
export function isValidEvent(event) {
  const eventParts = getEventParts(event);

  let prevPart = eventParts[0];
  let valid = true;

  for (let i = 1; i < eventParts.length; i++) {
    const eventPart = eventParts[i];

    if (isWildcard(eventPart) && isWildcard(prevPart)) {
      // This essentially checks for */** or **/* or **/**
      if ((eventPart + prevPart).length > 2) {
        valid = false;
        break;
      }
    }

    prevPart = eventPart;
  }

  return valid;
}


/**
 * Checks if the pubEvent matches the pattern event
 *
 * @param {String} pubEvent Event to check for match
 * @param {String} subEvent pattern subEvent
 *
 * @returns {Boolean} true if it matches
 *
 * @throws Invalid Pattern if it violates wildcard
 *     policies
 */
export function doesPatternMatch(pubEvent, subEvent) {
  if (!isValidEvent(subEvent)) throw new InvalidPatternError();

  // Publish event parts
  const pubParts = getEventParts(pubEvent);

  // Subscribe event parts
  const subParts = getEventParts(subEvent);


  // Closure that returns the next patterPart in the array
  const getNextSubPart = (patternIndex => i => {
    if (i) patternIndex = i + 1;
    else patternIndex++;

    return [subParts[patternIndex], patternIndex];
  })(-1);


  // Closure that returns the next eventPart in the array
  const getNextPubPart = (eventPartIndex => i => {
    if (i) eventPartIndex = i + 1;
    else eventPartIndex++;

    return [pubParts[eventPartIndex], eventPartIndex];
  })(-1);


  /**
   * Checks if the parts matches post a '**'
   * if not then, checks for match from
   * the next eventPart index
   *
   * @param {[String, Number]} eventPart Event part in the form of
   *       [eventPart, eventIndex]
   * @param {Number} nextPatternIndex Next Pattern index
   *
   * @returns {Boolean} true if parts match after '**'
   */
  function checkMulti([eventPart, eventIndex], nextPatternIndex) {
    if (!eventPart) return false;

    const isMatch = match([eventPart, eventIndex], getNextSubPart(nextPatternIndex - 1));

    return !isMatch ? checkMulti(getNextPubPart(eventIndex), nextPatternIndex) : true;
  }

  function match([eventPart, eventIndex] = getNextPubPart(), [patternPart] = getNextSubPart()) {
    // if eventPart is present but not patternPart
    // or vice-versa then it's not a match
    if ((!eventPart && patternPart && patternPart !== '**') || (!patternPart && eventPart)) return false;

    // if both parts are not present then
    // it's a match
    if (!eventPart && !patternPart) return true;


    // if it's not a pattern (*, **) then perform
    // a direct string match
    if (!isWildcard(patternPart)) {
      return patternPart === eventPart ? match() : false;
    }

    // Since * would match any string, goto next match;
    if (patternPart === '*') return match();

    // Else patternPart == '**'
    const [nextPatternPart, nextPatternIndex] = getNextSubPart();
    return nextPatternPart ? checkMulti([eventPart, eventIndex], nextPatternIndex) : true;
  }

  return match();
}


/**
 * Sanitizes the given event by removing all
 * empty parts. If `getParts` is true, then it
 * returns all the non-empty parts as a list else
 * string
 *
 * @param {String} event Event
 * @param {Boolean} getParts If true, then returns non-empty parts list
 *
 * @returns {String|String[]} sanitized-event
 */
export function sanitizeEvent(event, getParts = false) {
  let sanitizedEvent = getParts ? [] : '';
  let part = '';
  for (let i = 0, len = event.length; i < len; i++) {
    const char = event[i];

    if (char === SEPERATOR) {
      if (part) {
        if (getParts) sanitizedEvent.push(part);
        else if (i === len - 1) sanitizedEvent += part;
        else sanitizedEvent += `${part}/`;
      }

      part = '';
    } else {
      part += char;
    }
  }

  if (part) {
    getParts
      ? sanitizedEvent.push(part)
      : sanitizedEvent += part;
  }

  return sanitizedEvent;
}
