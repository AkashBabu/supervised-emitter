import { InvalidPatternError } from './errors';

const SEPERATOR = '/';

/**
 * Predicate that checks if the given
 * part is a wildcard part or not
 *
 * @param part Part of the event to check
 *
 * @returns {Boolean}
 */
function isWildcard(part: string) {
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
const getEventParts = (event: string): string[] => sanitizeEvent(event, true) as string[];

/**
 * Predicate that checks if any part of the
 * event is a wildcard or not
 *
 * @param event Event to check for wildcard
 *
 * @returns true if the given event contains
 *    wildcards
 */
export function isPatternEvent(event: string): boolean {
  return !!getEventParts(event).find(isWildcard);
}

/**
 * Checks if the given event is valid
 *
 * @param event event to check
 *
 * @returns {Boolean}
 */
export function isValidEvent(event: string) {
  const eventParts = getEventParts(event);

  // let prevPart = eventParts[0];
  let prevPart = '';

  return !eventParts.some((eventPart) => {
    if (isWildcard(prevPart) && isWildcard(eventPart)) {
      // This essentially checks for */** or **/* or **/**
      if ((eventPart + prevPart).length > 2) return true;
    }

    prevPart = eventPart;
  });
  // for (let i = 1; i < eventParts.length; i++) {
  //   const eventPart = eventParts[i];

  //   if (isWildcard(eventPart) && isWildcard(prevPart)) {
  //     // This essentially checks for */** or **/* or **/**
  //     if ((eventPart + prevPart).length > 2) {
  //       valid = false;
  //       break;
  //     }
  //   }

  //   prevPart = eventPart;
  // }

  // return valid;
}

/**
 * Closure that returns the next patterPart in the array
 *
 */
function arrayIterator(arr: any[]) {
  let index = -1;

  return (i?: number): [any, number] => {
    if (i) index = i + 1;
    else index++;

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
export function doesPatternMatch(pubEvent: string, subEvent: string): boolean {
  if (!isValidEvent(subEvent)) throw new InvalidPatternError();

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
  function checkMulti([eventPart, eventIndex]: [string, number], nextPatternIndex: number): boolean {
    if (!eventPart) return false;

    const isMatch = match([eventPart, eventIndex], getNextSubPart(nextPatternIndex - 1));

    return !isMatch ? checkMulti(getNextPubPart(eventIndex), nextPatternIndex) : true;
  }

  function match(
    [eventPart, eventIndex]: [string, number] = getNextPubPart(),
    [patternPart]: [string, number] = getNextSubPart(),
  ): boolean {
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
 * @param event Event
 * @param getParts If true, then returns non-empty parts list
 *
 * @returns sanitized-event
 */
export function sanitizeEvent(event: string, getParts: boolean = false): string | string[] {
  let sanitizedEvent = getParts ? [] : '';
  let part = '';
  for (let i = 0, len = event.length; i < len; i++) {
    const char = event[i];

    if (char === SEPERATOR) {
      if (part) {
        if (getParts) (sanitizedEvent as string[]).push(part);
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
      ? (sanitizedEvent as string[]).push(part)
      : sanitizedEvent += part;
  }

  return sanitizedEvent;
}
