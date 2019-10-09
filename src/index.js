import LFU from 'node-lfu-cache';

import DLL from './dll';
import { pipe, compose, getKeys } from './utils';
import { isPatternEvent, doesPatternMatch, sanitizeEvent } from './pattern';
import Logger from './logger';
import { SingletonError } from './errors';
import ThreadRunner from './threadRunner';


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
   * @param {Handler[]} middlewares array of middlewares
   * @param {Options} options
   */
  function initialize(middlewares = [], options = {}) {
    if (initialized) {
      throw new SingletonError();
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
      debug          : false,
      middlewares    : ({ data }) => data,
      subscribers    : new Map(), // map of event vs pipelines (DLL)
      patternEvents  : [], // list of pattern events
      subEventsCache : new LFU({}), // cache for maintaining pubEvents vs matching subEvents
      scopeId        : 0, // use to generate a new scope part
      threadRunner   : ThreadRunner(publisher, { maxRunners: 100 }),
    };
  }


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
   * @param  {...Handler} handlers List of handlers
   *
   * @returns {{unsubscribe: function, subscribe: Subscribe}}
   *    `unsubscribe` for unsubscribing from the event and
   *    `subscribe` for chaining multiple subscriptions
   */
  const subscribe = (event, ...handlers) => {
    event = sanitizeEvent(event);


    // Check if this is a new or existing event
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
      // Compose all the subscribers passed at once.
      // Users can use this feature if needed, else
      // can choose to go with the classical approach
      // of subscribing as many times as the handlers.
      handlers: pipe(...handlers),
    });

    logger.debug(`SUBSCRIBED => ${event}`);

    return {
      /**
       * Unsubscribes from this subscription
       */
      unsubscribe() {
        unsubscribe(event, eventHandler);
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
      subscribe(event, ...handlers) { // eslint-disable-line
        const subscription = subscribe(event, ...handlers);
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
   *
   * @param {String} subEvent Subscribed Event
   * @param {Handler} eventHandler Handler pipeline
   */
  const unsubscribe = (subEvent, eventHandler) => {
    const subscribers = state.subscribers.get(subEvent);
    // remove the handler from DLL
    if (subscribers) {
      subscribers.remove(eventHandler);

      // If there are no event handlers
      // for this event, then remove the event from
      // subscribers list (for space optimization).
      if (subscribers.length === 0) {
        state.subscribers.delete(subEvent);
      }
    }

    logger.debug(`UNSUBSCRIBED => ${subEvent}`);
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
      let matchingEvents = new Map();

      // if normal event subscribers are present
      // then add it as well
      state.subscribers.get(pubEvent) && matchingEvents.set(pubEvent, true);

      // Check if any pattern matches pubEvent
      state.patternEvents.forEach(pattern => {
        if (doesPatternMatch(pubEvent, pattern)) matchingEvents.set(pattern, true);
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
  const publish = (pubEvent, data) => state.threadRunner(pubEvent, data);


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
  const publisher = async (pubEvent, data) => {
    pubEvent = sanitizeEvent(pubEvent);

    const subEvents = getSubEvents(pubEvent);
    const subEventsArr = getKeys(subEvents);

    const ctx = {
      data,
      pubEvent,
      subEvents: subEventsArr,
    };

    ctx.data = await state.middlewares(ctx);

    return Promise.all(subEventsArr.map(async subEvent => {
      const eventHandlers = state.subscribers.get(subEvent);


      if (!eventHandlers) {
        subEvents.delete(subEvent);
        return null;
      }

      const handlingSubscribers = [];

      eventHandlers.forEach(({ handlers }) => {
        // use new ctx for every pipeline because
        // one pipeline must never affect the other
        // except middleware pipeline, else it gets
        // difficult to debug
        handlingSubscribers.push(handlers({ ...ctx }));
      });

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
  const scopeReg = new RegExp('^__scope_[0-9]+_/(.+)$');

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

    // return match ? match.groups.event : event;
    return match ? match[1] : event;
  }

  return {
    initialize,
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
