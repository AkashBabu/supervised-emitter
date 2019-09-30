"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.isPatternEvent = isPatternEvent;exports.isValidPattern = isValidPattern;exports.doesPatternMatch = doesPatternMatch;var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray")); /* eslint complexity: ["error", 8] */

var PART_SEPERATOR = '/';


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
function isPatternEvent(event) {
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
function isValidPattern(pattern) {
  var patternParts = pattern.split(PART_SEPERATOR).filter(Boolean);

  var prevPart = patternParts[0];
  var valid = true;

  for (var i = 1; i < patternParts.length; i++) {
    var patternPart = patternParts[i];

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
function doesPatternMatch(event, pattern) {
  if (!isValidPattern(pattern)) throw new Error('Invalid Pattern! Do no use **/*, */**, **/**');

  var eventParts = event.split(PART_SEPERATOR).filter(Boolean);

  var patternParts = pattern.split(PART_SEPERATOR).filter(Boolean);


  // Closure that returns the next patterPart in the array
  var getNextPatternPart = function (patternIndex) {return function (i) {
      if (i) patternIndex = i + 1;else
      patternIndex++;

      return [patternParts[patternIndex], patternIndex];
    };}(-1);


  // Closure that returns the next eventPart in the array
  var getNextEventPart = function (eventPartIndex) {return function (i) {
      if (i) eventPartIndex = i + 1;else
      eventPartIndex++;

      return [eventParts[eventPartIndex], eventPartIndex];
    };}(-1);


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
  function checkMulti(_ref, nextPatternIndex) {var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),eventPart = _ref2[0],eventIndex = _ref2[1];
    if (!eventPart) return false;

    var isMatch = match([eventPart, eventIndex], getNextPatternPart(nextPatternIndex - 1));

    return !isMatch ? checkMulti(getNextEventPart(eventIndex), nextPatternIndex) : true;
  }

  function match() {var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getNextEventPart(),_ref4 = (0, _slicedToArray2["default"])(_ref3, 2),eventPart = _ref4[0],eventIndex = _ref4[1];var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getNextPatternPart(),_ref6 = (0, _slicedToArray2["default"])(_ref5, 1),patternPart = _ref6[0];
    // if eventPart is present but not patternPart
    // or vice-versa then it's not a match
    if (!eventPart && patternPart && patternPart !== '**' || !patternPart && eventPart) return false;

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
    var _getNextPatternPart = getNextPatternPart(),_getNextPatternPart2 = (0, _slicedToArray2["default"])(_getNextPatternPart, 2),nextPatternPart = _getNextPatternPart2[0],nextPatternIndex = _getNextPatternPart2[1];
    return nextPatternPart ? checkMulti([eventPart, eventIndex], nextPatternIndex) : true;
  }

  return match();
}