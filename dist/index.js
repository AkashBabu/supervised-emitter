'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.compose = exports.pipe = undefined;var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _assign = require('babel-runtime/core-js/object/assign');var _assign2 = _interopRequireDefault(_assign);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);var _map = require('babel-runtime/core-js/map');var _map2 = _interopRequireDefault(_map);var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);var _nodeLfuCache = require('node-lfu-cache');var _nodeLfuCache2 = _interopRequireDefault(_nodeLfuCache);

var _dll = require('./dll');
var _utils = require('./utils');
var _patternMatch = require('./patternMatch');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


/**
                                                                                                                                             * SupervisedEmitter
                                                                                                                                             * It's a singleton of event emitter which supports
                                                                                                                                             * middlewares, event-tracing etc
                                                                                                                                             *
                                                                                                                                             * It's main applications can be found in
                                                                                                                                             * State management (React, Vue etc)
                                                                                                                                             * and nodejs for worker model
                                                                                                                                             *
                                                                                                                                             * @example
                                                                                                                                             * SupervisedEmitter.subscribe('page_load',
                                                                                                                                             *  (data) => console.log('page load data:', data),
                                                                                                                                             *  (data) => data.item += 1,
                                                                                                                                             *  (data) => console.log('after modification:', data),
                                                                                                                                             * )
                                                                                                                                             */
var SupervisedEmitter = function () {
  // Flag used to check for singleton
  var initialized = false;

  // This is used to maintain the context
  // throughout the singleton
  var state = getFreshState();

  /**
                                * Initializes a singleton of SupervisedEmitter
                                *
                                * @param {function[]} middlewares array of middlewares
                                * @param {Object} options
                                */
  function initialize() {var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (initialized) {
      throw new Error('Can\'t initialize singleton => "SupervisedEmitter", more than once');
    }
    initialized = true;

    state.debug = options.debug || false;
    state.middlewares = _utils.pipe.apply(undefined, (0, _toConsumableArray3.default)(middlewares));
  }

  /**
     * Should be used only for testing purposes!!!
     *
     * Reinitializes the singleton 😜
     *
     * @param {function[]} middlewares array of middlewares
     * @param {Object} options
     */
  function reInitialize(middlewares, options) {
    reset();

    initialize(middlewares, options);
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
      subscriptionId: 0,
      subscribers: new _map2.default(),
      subscriberEvent: new _map2.default(),
      patternEvents: [],
      subEventsCache: new _nodeLfuCache2.default({}),
      scopeId: 0 };

  }

  /**
     * Saves the eventhandler against the given
     * subscriptionId. This will be used during
     * unsubscription
     *
     * @param {number} subscriptionId SubscriptionId
     * @param {string} event Event being subscribed
     * @param {function} eventHandler composed event handlers
     */
  var setSubscriptionEvent = function setSubscriptionEvent(subscriptionId, event, eventHandler) {
    var eventArr = new Array(2);
    eventArr[0] = event;
    eventArr[1] = eventHandler;

    // Maitaining a map of subscriptionId vs event.
    // This helps us to know the event during
    // unsubscription
    state.subscriberEvent.set(subscriptionId, eventArr);
  };


  /**
      * Returns the event handlers for the given subscription
      * Id
      *
      * @param {number} subscriptionId Subscription Id
      *
      * @returns {object} Subscription's Event & handlers
      */
  var getSubscriptionEvent = function getSubscriptionEvent(subscriptionId) {return state.subscriberEvent.get(subscriptionId) || new Array(2);};


  /**
                                                                                                                                                 * Removes the event handlers for the given subscription
                                                                                                                                                 * Id
                                                                                                                                                 *
                                                                                                                                                 * @param {number} subscriptionId Subscription Id
                                                                                                                                                 *
                                                                                                                                                 */
  var delSubscriptionEvent = function delSubscriptionEvent(subscriptionId) {
    state.subscriberEvent.delete(subscriptionId);

    // state.subscribersEventHandlers[subscriptionId] = undefined;
  };


  /**
      * Goes through every publish event in cache
      * and checks if it matches the given patterns
      * and if match found, then add this pattern
      * to cached events
      *
      * @param {String} patternEvent Pattern event
      */
  var addEventToCache = function addEventToCache(patternEvent) {
    state.subEventsCache.forEach(function (cachedEvents, pubEvent) {
      if ((0, _patternMatch.doesPatternMatch)(pubEvent, patternEvent)) cachedEvents.set(patternEvent, true);
    });
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
      * @param  {...function} fns List of handlers
      *
      * @returns {{unsubscribe: function}} unsubscribe function for
      *    unsubscribing these handlers from the event
      */
  var _subscribe = function _subscribe(event) {for (var _len = arguments.length, fns = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {fns[_key - 1] = arguments[_key];}
    // Compose all the subscribers passed at once.
    // Users can use this feature if needed, else
    // can choose to go with the classical approach
    // of subscribing as many times as the handlers.
    // We should maintain a map of subscriptionId vs
    // composedFns in here to find the right one to be
    // removed during unsubscription
    if (!state.subscribers.get(event)) {
      // Cache has to be updated if the
      // new pattern event matches with the
      // publish event in cache
      if ((0, _patternMatch.isPatternEvent)(event)) {
        addEventToCache(event);

        state.patternEvents.push(event);
      }

      state.subscribers.set(event, new _dll.DLL());
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of removing
    // handlers during unsubscription without
    // having to create a new array each time
    // by means of splicing
    var eventHandler = state.subscribers.get(event).append({
      handlers: _utils.pipe.apply(undefined, fns) });


    // Generate a new subscriptionId, so that
    // the same can be used to unsubscribe.
    // This helps us to unsubscribe from composed
    // functions as well.
    var subscriptionId = state.subscriptionId++;

    setSubscriptionEvent(subscriptionId, event, eventHandler);


    return {
      /**
              * Closure function is exposed instead of
              * returning subscriptionId because of the
              * risk of user using a wrong subscriptionId
              * during unsubscription.
              */
      unsubscribe: function unsubscribe() {
        _unsubscribe(subscriptionId);
      },

      /**
          * This method allows chaining subscription to
          * multiple events via the same subscription
          *
          * @example
          * const subscription = SE.subscribe('/test-event', handler1)
          *  .subscribe('/hello/world', handler2, handler3)
          *  .subscribe('/tom/cat/*', handler4, handler5)
          *
          * subscription.unsubscribe()
          *
          * @param {String} event Subscription event
          * @param  {...function} fns List of handlers
          */
      subscribe: function subscribe(event) {for (var _len2 = arguments.length, fns = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {fns[_key2 - 1] = arguments[_key2];} // eslint-disable-line
        var subscription = _subscribe.apply(undefined, [event].concat((0, _toConsumableArray3.default)(fns)));
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
      * associated with the given subscriptionId
      *
      * @param {number} subscriptionId Subscription ID
      */
  var _unsubscribe = function _unsubscribe(subscriptionId) {var _getSubscriptionEvent =
    getSubscriptionEvent(subscriptionId),_getSubscriptionEvent2 = (0, _slicedToArray3.default)(_getSubscriptionEvent, 2),event = _getSubscriptionEvent2[0],eventHandler = _getSubscriptionEvent2[1];

    // remove the handler from DLL
    state.subscribers.get(event).remove(eventHandler);

    // If there are no event handlers
    // for this event, then remove the event from
    // subscribers list (for space optimization).
    if (state.subscribers.get(event).length === 0) {
      state.subscribers.delete(event);
    }

    delSubscriptionEvent(subscriptionId);
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
      var matchingEvents = new _map2.default();
      matchingEvents.set(pubEvent, true);

      state.patternEvents.forEach(function (pattern) {
        if ((0, _patternMatch.doesPatternMatch)(pubEvent, pattern)) matchingEvents.set(pattern, true);
      });

      state.subEventsCache.set(pubEvent, matchingEvents);

      subEvents = matchingEvents;
    }

    return subEvents;
  };


  /**
      * Publishes the given data to all the subscribers
      * that match the event.
      *
      * Note: We pass only the second args (one param)
      * to the subscribers. This is intentionally done
      * because when the eventHandlers are composed, the output
      * of one is used by the next, incase of which we'll not be
      * able to maintain a standard function signature,
      * if we allow more than one param to be passed to subscribers.
      *
      * @param {String} pubEvent Event to publish the given data
      * @param {Object} data Any data that need to be published
      *
      * @returns {Promise}
      */
  var publish = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(pubEvent, data) {var subEvents, ctx, subEventsIter, subEventItem, subEvent, eventHandlers;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
              subEvents = getSubEvents(pubEvent);

              ctx = {
                data: data,
                pubEvent: pubEvent };_context.next = 4;return (


                state.middlewares(ctx));case 4:ctx.data = _context.sent;

              subEventsIter = subEvents.keys();

              subEventItem = subEventsIter.next();
              while (!subEventItem.done) {
                subEvent = subEventItem.value;

                eventHandlers = state.subscribers.get(subEvent);

                if (!eventHandlers) {
                  subEvents.delete(subEvent);
                } else {
                  // loop through the entire dll chain
                  while (eventHandlers = eventHandlers.getNext()) {
                    // use new ctx for every pipeline because
                    // one pipeline must never affect the other
                    // except middleware pipeline, else it gets
                    // difficult to debug
                    eventHandlers.meta.handlers((0, _assign2.default)({}, ctx));
                  }
                }

                subEventItem = subEventsIter.next();
              }case 8:case 'end':return _context.stop();}}}, _callee, undefined);}));return function publish(_x3, _x4) {return _ref2.apply(this, arguments);};}();



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
    return function (event) {return '__scope_' + rand + '_/' + event;};
  }

  // Pre-compiling regex for efficiency
  var scopeReg = new RegExp('^__scope_[0-9]+_/(?<event>.+)');

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
    if (!match) return null;

    return match.groups.event;
  }

  return {
    initialize: initialize,
    reInitialize: reInitialize,
    reset: reset,
    publish: publish,
    subscribe: _subscribe,
    getScope: getScope,
    unScope: unScope,
    displayName: 'SupervisedEmitter' };

}();exports.



pipe = _utils.pipe;exports.
compose = _utils.compose;exports.default =


SupervisedEmitter;

module.exports = SupervisedEmitter;