"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.isPatternEvent = isPatternEvent;exports.isValidEvent = isValidEvent;exports.doesPatternMatch = doesPatternMatch;exports.sanitizeEvent = sanitizeEvent;var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _errors = require("./errors"); /* eslint complexity: [error, 12] */

var SEPERATOR = '/';

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
var getEventParts = function getEventParts(event) {return sanitizeEvent(event, true);};


/**
                                                                                         * Predicate that checks if any part of the
                                                                                         * event is a wildcard or not
                                                                                         *
                                                                                         * @param {String} event Event to check for wildcard
                                                                                         *
                                                                                         * @returns {Boolean}
                                                                                         */
function isPatternEvent(event) {
  return getEventParts(event).find(isWildcard);
}


/**
   * Checks if the given event is valid
   *
   * @param {String} event event to check
   *
   * @returns {Boolean}
   */
function isValidEvent(event) {
  var eventParts = getEventParts(event);

  var prevPart = eventParts[0];
  var valid = true;

  for (var i = 1; i < eventParts.length; i++) {
    var eventPart = eventParts[i];

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
function doesPatternMatch(pubEvent, subEvent) {
  if (!isValidEvent(subEvent)) throw new _errors.InvalidPatternError();

  // Publish event parts
  var pubParts = getEventParts(pubEvent);

  // Subscribe event parts
  var subParts = getEventParts(subEvent);


  // Closure that returns the next patterPart in the array
  var getNextSubPart = function (patternIndex) {return function (i) {
      if (i) patternIndex = i + 1;else
      patternIndex++;

      return [subParts[patternIndex], patternIndex];
    };}(-1);


  // Closure that returns the next eventPart in the array
  var getNextPubPart = function (eventPartIndex) {return function (i) {
      if (i) eventPartIndex = i + 1;else
      eventPartIndex++;

      return [pubParts[eventPartIndex], eventPartIndex];
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

    var isMatch = match([eventPart, eventIndex], getNextSubPart(nextPatternIndex - 1));

    return !isMatch ? checkMulti(getNextPubPart(eventIndex), nextPatternIndex) : true;
  }

  function match() {var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getNextPubPart(),_ref4 = (0, _slicedToArray2["default"])(_ref3, 2),eventPart = _ref4[0],eventIndex = _ref4[1];var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getNextSubPart(),_ref6 = (0, _slicedToArray2["default"])(_ref5, 1),patternPart = _ref6[0];
    // if eventPart is present but not patternPart
    // or vice-versa then it's not a match
    if (!eventPart && patternPart && patternPart !== '**' || !patternPart && eventPart) return false;

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
    var _getNextSubPart = getNextSubPart(),_getNextSubPart2 = (0, _slicedToArray2["default"])(_getNextSubPart, 2),nextPatternPart = _getNextSubPart2[0],nextPatternIndex = _getNextSubPart2[1];
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
function sanitizeEvent(event) {var getParts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var sanitizedEvent = getParts ? [] : '';
  var part = '';
  for (var i = 0, len = event.length; i < len; i++) {
    var _char = event[i];

    if (_char === SEPERATOR) {
      if (part) {
        if (getParts) sanitizedEvent.push(part);else
        if (i === len - 1) sanitizedEvent += part;else
        sanitizedEvent += "".concat(part, "/");
      }

      part = '';
    } else {
      part += _char;
    }
  }

  if (part) {
    getParts ?
    sanitizedEvent.push(part) :
    sanitizedEvent += part;
  }

  return sanitizedEvent;
}