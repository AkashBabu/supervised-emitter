import LFU from 'node-lfu-cache';

import { DLL } from './dll';
import { pipe, compose } from './utils';
import { isPatternEvent, doesPatternMatch } from './patternMatch';
import Logger from './logger';


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
const SupervisedEmitter = (() => {
  const logger = Logger(Logger.LEVEL.DEBUG, false);
  logger.setPrefix('[SE]:');

  // Flag used to check for singleton
  let initialized = false;

  // This is used to maintain the context
  // throughout the singleton
  let state = getFreshState();

  /**
   * Initializes a singleton of SupervisedEmitter
   *
   * @param {function[]} middlewares array of middlewares
   * @param {Object} options
   */
  function initialize(middlewares = [], options = {}) {
    if (initialized) {
      throw new Error('Can\'t initialize singleton => "SupervisedEmitter", more than once');
    }
    initialized = true;

    const { debug = false, lfu = { max: 100 } } = options;
    state.debug = debug;
    logger[debug ? 'enable' : 'disable']();

    state.middlewares = pipe(...middlewares);
    state.subEventsCache = new LFU(lfu);

    logger.debug('INITIALIZED');
  }

  /**
   * Should be used only for testing purposes!!!
   *
   * Reinitializes the singleton 😜
   *
   * This is equivalent to running reset() -> initialize()
   *
   * @param {function[]} middlewares array of middlewares
   * @param {Object} options
   */
  function reInitialize(middlewares, options) {
    logger.debug('RE-INITIALIZING');

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
      debug           : false,
      middlewares     : ({ data }) => data,
      subscriptionId  : 0,
      subscribers     : new Map(),
      subscriberEvent : new Map(),
      patternEvents   : [],
      subEventsCache  : new LFU({}),
      scopeId         : 0,
    };
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
  const setSubscriptionEvent = (subscriptionId, event, eventHandler) => {
    const eventArr = new Array(2);
    eventArr[0] = event;
    eventArr[1] = eventHandler;

    // Maitaining a map of subscriptionId vs event.
    // This helps us to determine the event during
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
  const getSubscriptionEvent = subscriptionId => state.subscriberEvent.get(subscriptionId) || new Array(2);


  /**
   * Removes the event handlers for the given subscription
   * Id
   *
   * @param {number} subscriptionId Subscription Id
   *
   */
  const delSubscriptionEvent = subscriptionId => {
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
  const addPatternEventToCache = patternEvent => {
    state.subEventsCache.forEach((cachedEvents, pubEvent) => {
      if (doesPatternMatch(pubEvent, patternEvent)) cachedEvents.set(patternEvent, true);
    });
  };

  /**
   * Checks if the matching pubEvent is present
   * in the cache, if so then it adds this event
   *
   * @param {String} event Normal event (w/o pattern)
   */
  const addNormalEventToCache = event => {
    const matchingEvents = state.subEventsCache.peek(event);
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
   * @param  {...function} fns List of handlers
   *
   * @returns {{unsubscribe: function}} unsubscribe function for
   *    unsubscribing these handlers from the event
   */
  const subscribe = (event, ...fns) => {
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
      if (isPatternEvent(event)) {
        addPatternEventToCache(event);

        state.patternEvents.push(event);
      } else {
        addNormalEventToCache(event);
      }

      state.subscribers.set(event, new DLL());
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of removing
    // handlers during unsubscription without
    // having to create a new array each time
    // by means of splicing
    const eventHandler = state.subscribers.get(event).append({
      handlers: pipe(...fns),
    });

    // Generate a new subscriptionId, so that
    // the same can be used to unsubscribe.
    // This helps us to unsubscribe from composed
    // functions as well.
    const subscriptionId = state.subscriptionId++;

    setSubscriptionEvent(subscriptionId, event, eventHandler);

    logger.debug(`SUBSCRIBED => ${event}`);

    return {
      /**
       * Closure function is exposed instead of
       * returning subscriptionId because of the
       * risk of user using a wrong subscriptionId
       * during unsubscription.
       */
      unsubscribe() {
        unsubscribe(subscriptionId);
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
      subscribe(event, ...fns) { // eslint-disable-line
        const subscription = subscribe(event, ...fns);
        const self = this;

        return {
          subscribe: subscription.subscribe,
          unsubscribe() {
            self.unsubscribe();
            subscription.unsubscribe();
          },
        };
      },
    };
  };


  /**
   * Unsubscribes the event handlers from the event
   * associated with the given subscriptionId
   *
   * @param {number} subscriptionId Subscription ID
   */
  const unsubscribe = subscriptionId => {
    const [event, eventHandler] = getSubscriptionEvent(subscriptionId);

    const subscribers = state.subscribers.get(event);
    // remove the handler from DLL
    if (subscribers) {
      subscribers.remove(eventHandler);

      // If there are no event handlers
      // for this event, then remove the event from
      // subscribers list (for space optimization).
      if (subscribers.length === 0) {
        state.subscribers.delete(event);
      }
    }

    delSubscriptionEvent(subscriptionId);

    logger.debug(`UNSUBSCRIBED => ${event}`);
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
  const getSubEvents = pubEvent => {
    let subEvents = state.subEventsCache.get(pubEvent);

    if (!subEvents) {
      const matchingEvents = new Map();

      // if normal event subscribers are present
      // then add it as well
      state.subscribers.get(pubEvent) && matchingEvents.set(pubEvent, true);

      // Check if any pattern matches pubEvent
      state.patternEvents.forEach(pattern => {
        if (doesPatternMatch(pubEvent, pattern)) matchingEvents.set(pattern, true);
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
  const publish = async (pubEvent, data) => {
    const subEvents = getSubEvents(pubEvent);

    const subEventsArr = [];

    (() => {
      const subEventsIter = subEvents.keys();
      let subEventItem = subEventsIter.next();
      while (!subEventItem.done) {
        subEventsArr.push(subEventItem.value);
        subEventItem = subEventsIter.next();
      }
    })();

    const ctx = {
      data,
      pubEvent,
      subEvents: subEventsArr,
    };

    ctx.data = await state.middlewares(ctx);

    return Promise.all(subEventsArr.map(async subEvent => {
      let eventHandlers = state.subscribers.get(subEvent);

      const handlingSubscribers = [];

      if (!eventHandlers) {
        subEvents.delete(subEvent);
      } else {
        // loop through the entire dll chain
        while (eventHandlers = eventHandlers.getNext()) {
          // use new ctx for every pipeline because
          // one pipeline must never affect the other
          // except middleware pipeline, else it gets
          // difficult to debug
          handlingSubscribers.push(eventHandlers.meta.handlers({ ...ctx }));
        }
      }

      return Promise.all(handlingSubscribers);
    }));
  };


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
    const rand = state.scopeId++;
    return event => `__scope_${rand}_/${event}`;
  }

  // Pre-compiling regex for efficiency
  const scopeReg = new RegExp('^__scope_[0-9]+_/(?<event>.+)');

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
    const match = event.match(scopeReg);
    if (!match) return null;

    return match.groups.event;
  }

  return {
    initialize,
    reInitialize,
    reset,
    publish,
    subscribe,
    getScope,
    unScope,
    displayName: 'SupervisedEmitter',
  };
})();


export {
  pipe,
  compose,
};

export default SupervisedEmitter;

module.exports = SupervisedEmitter;
