"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, "pipe", { enumerable: true, get: function get() {return _utils.pipe;} });Object.defineProperty(exports, "compose", { enumerable: true, get: function get() {return _utils.compose;} });exports["default"] = void 0;var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));var _nodeLfuCache = _interopRequireDefault(require("node-lfu-cache"));

var _dll = _interopRequireDefault(require("./dll"));
var _utils = require("./utils");
var _pattern = require("./pattern");
var _logger = _interopRequireDefault(require("./logger"));
var _errors = require("./errors");
var _threadRunner = _interopRequireDefault(require("./threadRunner"));function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(source, true).forEach(function (key) {(0, _defineProperty2["default"])(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(source).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @typedef {Object} Context
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {any} data Published data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {String} pubEvent Published event
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {String[]} subEvents Matching subscribed events
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {(data: any) => any} end Can be used to stop the pipeline
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Handler function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @callback Handler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {Context} ctx Pipeline context
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @typedef {Object} Options
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @property {Boolean} debug Debug
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @property {Object} lfu LFU cache constructor argument
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Subscribe function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @callback Subscribe
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @param {String} event subscription event
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @param {...Handler} handlers list of handlers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @returns {{unsubscribe: function, subscribe: Subscribe}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * SupervisedEmitter
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * It's a singleton of event emitter which supports
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * middlewares, event-tracing etc
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * It's main applications can be found in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * State management (React, Vue etc)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * and nodejs for worker model
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */
var SupervisedEmitter = function () {
  var logger = (0, _logger["default"])(_logger["default"].LEVEL.DEBUG, false);
  logger.setPrefix('[SE]:');

  // Flag used to check for singleton
  var initialized = false;

  // This is used to maintain the context
  // throughout the singleton
  var state = getFreshState();


  /**
                                * Initializes a singleton of SupervisedEmitter
                                *
                                * @param {Handler[]} middlewares array of middlewares
                                * @param {Options} options
                                */
  function initialize() {var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (initialized) {
      throw new _errors.SingletonError();
    }
    initialized = true;var _options$debug =

    options.debug,debug = _options$debug === void 0 ? false : _options$debug,_options$lfu = options.lfu,lfu = _options$lfu === void 0 ? { max: 100 } : _options$lfu;
    state.debug = debug;
    logger[debug ? 'enable' : 'disable']();

    state.middlewares = _utils.pipe.apply(void 0, (0, _toConsumableArray2["default"])(middlewares));
    state.subEventsCache = new _nodeLfuCache["default"](lfu);


    logger.debug('INITIALIZED');
  }


  /**
     * Should be used only for testing purposes!!!
     *
     * Resets the state and enables reinitialization
     * of the singleton
     */
  function reset() {
    initialized = false;

    state = getFreshState();
  }


  /**
     * Returns a fresh / new checkout of
     * state
     */
  function getFreshState() {
    return {
      debug: false,
      middlewares: function middlewares(_ref) {var data = _ref.data;return data;},
      subscribers: new Map(), // map of event vs pipelines (DLL)
      patternEvents: [], // list of pattern events
      subEventsCache: new _nodeLfuCache["default"]({}), // cache for maintaining pubEvents vs matching subEvents
      scopeId: 0, // use to generate a new scope part
      threadRunner: (0, _threadRunner["default"])(publisher, { maxRunners: 100 }) };

  }


  /**
     * Goes through every publish event in cache
     * and checks if it matches the given patterns
     * and if match found, then add this pattern
     * to cached events
     *
     * @param {String} patternEvent Pattern event
     */
  var addPatternEventToCache = function addPatternEventToCache(patternEvent) {
    state.subEventsCache.forEach(function (cachedEvents, pubEvent) {
      if ((0, _pattern.doesPatternMatch)(pubEvent, patternEvent)) cachedEvents.set(patternEvent, true);
    });
  };

  /**
      * Checks if the matching pubEvent is present
      * in the cache, if so then it adds this event
      *
      * @param {String} event Normal event (w/o pattern)
      */
  var addNormalEventToCache = function addNormalEventToCache(event) {
    var matchingEvents = state.subEventsCache.peek(event);
    if (matchingEvents) {
      matchingEvents.set(event, true);
    }
  };


  /**
      * Subscribes to given event and pipes all the
      * handlers passed.
      *
      * Please note that each handler must pass on the
      * data that must be handled by the next handler, as
      * all these handlers will be piped (compose in reverse direction).
      *
      * For more info on pipe visit:
      * https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937
      *
      * @param {String} event Subscription event
      * @param  {...Handler} handlers List of handlers
      *
      * @returns {{unsubscribe: function, subscribe: Subscribe}}
      *    `unsubscribe` for unsubscribing from the event and
      *    `subscribe` for chaining multiple subscriptions
      */
  var _subscribe = function _subscribe(event) {
    event = (0, _pattern.sanitizeEvent)(event);


    // Check if this is a new or existing event
    if (!state.subscribers.get(event)) {
      // Cache has to be updated if the
      // new pattern event matches with the
      // publish event in cache
      if ((0, _pattern.isPatternEvent)(event)) {
        addPatternEventToCache(event);
        state.patternEvents.push(event);
      } else {
        addNormalEventToCache(event);
      }

      state.subscribers.set(event, new _dll["default"]());
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of removing
    // handlers during unsubscription without
    // having to create a new array each time
    // by means of splicing
    for (var _len = arguments.length, handlers = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {handlers[_key - 1] = arguments[_key];}var eventHandler = state.subscribers.get(event).append({
      // Compose all the subscribers passed at once.
      // Users can use this feature if needed, else
      // can choose to go with the classical approach
      // of subscribing as many times as the handlers.
      handlers: _utils.pipe.apply(void 0, handlers) });


    logger.debug("SUBSCRIBED => ".concat(event));

    return {
      /**
              * Unsubscribes from this subscription
              */
      unsubscribe: function unsubscribe() {
        _unsubscribe(event, eventHandler);
      },

      /**
          * This method allows chaining subscription to
          * multiple events via the same subscription
          *
          * @param {String} event Subscription event
          * @param  {...Handler} handlers List of handlers
          *
          * @returns {{unsubscribe: function, subscribe: Subscribe}}
          *    `unsubscribe` for unsubscribing from the event and
          *    `subscribe` for chaining multiple subscriptions
          */
      subscribe: function subscribe(event) {for (var _len2 = arguments.length, handlers = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {handlers[_key2 - 1] = arguments[_key2];} // eslint-disable-line
        var subscription = _subscribe.apply(void 0, [event].concat(handlers));
        var self = this;

        return {
          subscribe: subscription.subscribe,
          unsubscribe: function unsubscribe() {
            self.unsubscribe();
            subscription.unsubscribe();
          } };

      } };

  };


  /**
      * Unsubscribes the event handlers from the event
      *
      * @param {String} subEvent Subscribed Event
      * @param {Handler} eventHandler Handler pipeline
      */
  var _unsubscribe = function _unsubscribe(subEvent, eventHandler) {
    var subscribers = state.subscribers.get(subEvent);
    // remove the handler from DLL
    if (subscribers) {
      subscribers.remove(eventHandler);

      // If there are no event handlers
      // for this event, then remove the event from
      // subscribers list (for space optimization).
      if (subscribers.length === 0) {
        state.subscribers["delete"](subEvent);
      }
    }

    logger.debug("UNSUBSCRIBED => ".concat(subEvent));
  };


  /**
      * Returns all the matching subscribed events
      * given publish event (including glob pattern)
      *
      * This is the place where you can optimize the
      * matching logic by caching the matched events.
      *
      * @param {String} pubEvent Publish event
      *
      * @returns {Map} map of matching patterns vs state
      */
  var getSubEvents = function getSubEvents(pubEvent) {
    var subEvents = state.subEventsCache.get(pubEvent);

    if (!subEvents) {
      var matchingEvents = new Map();

      // if normal event subscribers are present
      // then add it as well
      state.subscribers.get(pubEvent) && matchingEvents.set(pubEvent, true);

      // Check if any pattern matches pubEvent
      state.patternEvents.forEach(function (pattern) {
        if ((0, _pattern.doesPatternMatch)(pubEvent, pattern)) matchingEvents.set(pattern, true);
      });

      state.subEventsCache.set(pubEvent, matchingEvents);

      subEvents = matchingEvents;

      // avoid memory leakage
      matchingEvents = null;
    }

    return subEvents;
  };


  /**
      * Adds the publish task to publisher queue
      *
      * @param {String} pubEvent Event to publish the given data
      * @param {Object} data Any data that need to be published
      *
      * @returns {Promise}
      */
  var publish = function publish(pubEvent, data) {return state.threadRunner(pubEvent, data);};


  /**
                                                                                                * Publishes the given data to all the subscribers
                                                                                                * that match the event.
                                                                                                *
                                                                                                * Note: We pass only the second argument (one param)
                                                                                                * to the subscribers. This is intentionally done
                                                                                                * because when the eventHandlers are piped (i.e. the output
                                                                                                * of one is used by the next), incase of which we'll not be
                                                                                                * able to maintain a standard function signature,
                                                                                                * if we allow more than one param to be passed to subscribers.
                                                                                                *
                                                                                                * @param {String} pubEvent Event to publish the given data
                                                                                                * @param {Object} data Any data that need to be published
                                                                                                *
                                                                                                * @returns {Promise}
                                                                                                */
  var publisher = /*#__PURE__*/function () {var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(pubEvent, data) {var subEvents, subEventsArr, ctx;return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
              pubEvent = (0, _pattern.sanitizeEvent)(pubEvent);

              subEvents = getSubEvents(pubEvent);
              subEventsArr = (0, _utils.getKeys)(subEvents);

              ctx = {
                data: data,
                pubEvent: pubEvent,
                subEvents: subEventsArr };_context2.next = 6;return (


                state.middlewares(ctx));case 6:ctx.data = _context2.sent;return _context2.abrupt("return",

              Promise.all(subEventsArr.map( /*#__PURE__*/function () {var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(subEvent) {var eventHandlers, handlingSubscribers;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                          eventHandlers = state.subscribers.get(subEvent);if (


                          eventHandlers) {_context.next = 4;break;}
                          subEvents["delete"](subEvent);return _context.abrupt("return",
                          null);case 4:


                          handlingSubscribers = [];

                          eventHandlers.forEach(function (_ref4) {var handlers = _ref4.handlers;
                            // use new ctx for every pipeline because
                            // one pipeline must never affect the other
                            // except middleware pipeline, else it gets
                            // difficult to debug
                            handlingSubscribers.push(handlers(_objectSpread({}, ctx)));
                          });return _context.abrupt("return",

                          Promise.all(handlingSubscribers));case 7:case "end":return _context.stop();}}}, _callee);}));return function (_x3) {return _ref3.apply(this, arguments);};}())));case 8:case "end":return _context2.stop();}}}, _callee2);}));return function publisher(_x, _x2) {return _ref2.apply(this, arguments);};}();




  /**
                                                                                                                                                                                                                                                                                                                                        * Adds scope to a event by prefixing
                                                                                                                                                                                                                                                                                                                                        * it with a incrementing counter string,
                                                                                                                                                                                                                                                                                                                                        * such that everytime this is called the
                                                                                                                                                                                                                                                                                                                                        * subscribers can listen only on scoped events.
                                                                                                                                                                                                                                                                                                                                        * This is especially useful when multiple
                                                                                                                                                                                                                                                                                                                                        * instances of the same class is listening and
                                                                                                                                                                                                                                                                                                                                        * is interested only in events of its own instance.
                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                        * @example
                                                                                                                                                                                                                                                                                                                                        * const scope = getScope()
                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                        * // ...
                                                                                                                                                                                                                                                                                                                                        * SE.subscribe(scope('asdf/asdf/asdf'))
                                                                                                                                                                                                                                                                                                                                        * // ...
                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                        * <ChildComponent scope={scope} />
                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                        * /// In ChildComponent.jsx
                                                                                                                                                                                                                                                                                                                                        * SE.publish(this.props.scope('asdf/asdf/asdf'),  data)
                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                        * @returns {function} that can add scope to events
                                                                                                                                                                                                                                                                                                                                        */
  function getScope() {
    var rand = state.scopeId++;
    return function (event) {return "__scope_".concat(rand, "_/").concat(event);};
  }

  // Pre-compiling regex for efficiency
  var scopeReg = new RegExp('^__scope_[0-9]+_/(.+)$');

  /**
                                                        * Removes the scope from the given
                                                        * event
                                                        *
                                                        * This method can be used in your middlewares
                                                        * to unshell the scope part in the topic
                                                        *
                                                        * @param {String} event Scoped event
                                                        *
                                                        * @returns {String} event without scope
                                                        */
  function unScope(event) {
    var match = event.match(scopeReg);

    // return match ? match.groups.event : event;
    return match ? match[1] : event;
  }

  return {
    initialize: initialize,
    reset: reset,
    publish: publish,
    subscribe: _subscribe,
    getScope: getScope,
    unScope: unScope,
    displayName: 'SupervisedEmitter' };

}();var _default =







SupervisedEmitter;exports["default"] = _default;

module.exports = SupervisedEmitter;