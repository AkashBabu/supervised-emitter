/* eslint complexity: ["error", 8] */

const PART_SEPERATOR = '/';


/**
 * Predicate that checks if the given
 * part is a pattern part or not
 *
 * @param {String} part Part of the event to check
 *
 * @returns {Boolean}
 */
function isPattern(part) {
  return part === '*' || part === '**';
}


/**
 * Predicate the checks if any part of the
 * event is a pattern or not
 *
 * @param {String} event Event to check for pattern
 *
 * @returns {Boolean}
 */
export function isPatternEvent(event) {
  return event.split(PART_SEPERATOR).find(isPattern);
}


/**
 * Check if the given pattern is valid
 * or not
 *
 * @param {String} pattern pattern to check
 *
 * @returns {Boolean}
 */
export function isValidPattern(pattern) {
  const patternParts = pattern.split(PART_SEPERATOR).filter(Boolean);

  let prevPart = patternParts[0];
  let valid = true;

  for (let i = 1; i < patternParts.length; i++) {
    const patternPart = patternParts[i];

    if (isPattern(patternPart) && isPattern(prevPart)) {
      // This essentially checks for */** or **/* or **/**
      if ((patternPart + prevPart).length > 2) {
        valid = false;
        break;
      }
    }

    prevPart = patternPart;
  }

  return valid;
}


/**
 * Checks if the event is matching for the
 * given pattern
 *
 * @param {String} event Event to check for match
 * @param {String} pattern Expected pattern
 *
 * @returns {Boolean} true if it matches
 *
 * @throws Invalid Pattern if it violates patterns
 *     policies
 */
export function doesPatternMatch(event, pattern) {
  if (!isValidPattern(pattern)) throw new Error('Invalid Pattern! Do no use **/*, */**, **/**');

  const eventParts = event.split(PART_SEPERATOR).filter(Boolean);

  const patternParts = pattern.split(PART_SEPERATOR).filter(Boolean);


  // Closure that returns the next patterPart in the array
  const getNextPatternPart = (patternIndex => i => {
    if (i) patternIndex = i + 1;
    else patternIndex++;

    return [patternParts[patternIndex], patternIndex];
  })(-1);


  // Closure that returns the next eventPart in the array
  const getNextEventPart = (eventPartIndex => i => {
    if (i) eventPartIndex = i + 1;
    else eventPartIndex++;

    return [eventParts[eventPartIndex], eventPartIndex];
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

    const isMatch = match([eventPart, eventIndex], getNextPatternPart(nextPatternIndex - 1));

    return !isMatch ? checkMulti(getNextEventPart(eventIndex), nextPatternIndex) : true;
  }

  function match([eventPart, eventIndex] = getNextEventPart(), [patternPart] = getNextPatternPart()) {
    // if eventPart is present but not patternPart
    // or vice-versa then it's not a match
    if ((!eventPart && patternPart && patternPart !== '**') || (!patternPart && eventPart)) return false;

    // if both parts are not present then
    // it's a match
    if (!eventPart && !patternPart) return true;


    // if it's not a pattern (*, **) then perform
    // a direct string match
    if (!isPattern(patternPart)) {
      return patternPart === eventPart ? match() : false;
    }

    // Since * would match any string, goto next match;
    if (patternPart === '*') return match();

    // Else patternPart == '**'
    const [nextPatternPart, nextPatternIndex] = getNextPatternPart();
    return nextPatternPart ? checkMulti([eventPart, eventIndex], nextPatternIndex) : true;
  }

  return match();
}
