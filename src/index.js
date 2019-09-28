import LFU from 'node-lfu-cache';

import { DLL } from './dll';
import { pipe, compose } from './utils';
import { isPatternEvent, doesPatternMatch } from './patternMatch';


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

    state.debug = options.debug || false;
    state.middlewares = pipe(...middlewares);
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
      debug                    : false,
      middlewares              : ({ data }) => data,
      subscriptionId           : 0,
      subscribers              : {},
      subscribersEventHandlers : {},
      patternEvents            : [],
      subEventsCache           : new LFU({}),
      scopeId                  : 0,
    };
  }

  /**
   * Saves the eventhandler against the given
   * subscriptionId. This will be used during
   * unsubscription
   *
   * @param {number} subscriptionId SubscriptionId
   * @param {string} event Event being subscribed
   * @param {function} eventHandler composed functions
   */
  const setEventHandler = (subscriptionId, event, eventHandler) => {
    // Maitaining a map of subscriptionId vs event.
    // This helps us to know the event during
    // unsubscription
    state.subscribersEventHandlers[subscriptionId] = {
      event,
      eventHandler,
    };
  };


  /**
   * Returns the event handlers for the given subscription
   * Id
   *
   * @param {number} subscriptionId Subscription Id
   *
   * @returns {object}
   */
  const getEventHandler = subscriptionId => state.subscribersEventHandlers[subscriptionId] || {};


  /**
   * Removes the event handlers for the given subscription
   * Id
   *
   * @param {number} subscriptionId Subscription Id
   *
   */
  const delEventHandler = subscriptionId => {
    state.subscribersEventHandlers[subscriptionId] = undefined;
  };


  /**
   * Goes through every publish event in cache
   * and checks if it matches the given patterns
   * and if match found, then add this pattern
   * to cached events
   *
   * @param {String} patternEvent Pattern event
   */
  const addEventToCache = patternEvent => {
    state.subEventsCache.forEach((cachedEvents, pubEvent) => {
      if (doesPatternMatch(pubEvent, patternEvent)) cachedEvents.set(patternEvent, true);
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
  const subscribe = (event, ...fns) => {
    // Compose all the subscribers passed at once.
    // Users can use this feature if needed, else
    // can choose to go with the classical approach
    // of subscribing as many times as the handlers.
    // We should maintain a map of subscriptionId vs
    // composedFns in here to find the right one to be
    // removed during unsubscription
    if (!state.subscribers[event]) {
      // Cache has to be updated if the
      // new pattern event matches with the
      // publish event in cache
      if (isPatternEvent(event)) {
        addEventToCache(event);

        state.patternEvents.push(event);
      }

      state.subscribers[event] = new DLL();
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of removing
    // handlers during unsubscription without
    // having to create a new array each time
    // by means of splicing
    const eventHandler = state.subscribers[event].append({
      handlers: pipe(...fns),
    });

    // Generate a new subscriptionId, so that
    // the same can be used to unsubscribe.
    // This helps us to unsubscribe from composed
    // functions as well.
    const subscriptionId = state.subscriptionId++;

    setEventHandler(subscriptionId, event, eventHandler);


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
    const { event, eventHandler } = getEventHandler(subscriptionId);
    state.subscribers[event].remove(eventHandler);

    // If there are no event handlers
    // for this event, then remove the event from
    // subscribers list (for space optimization).
    if (state.subscribers[event].length === 0) {
      // For more info on the below statement visit:
      // https://jsperf.com/delete-vs-undefined-vs-null/6
      state.subscribers[event] = undefined;
    }

    delEventHandler(subscriptionId);
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
      matchingEvents.set(pubEvent, true);

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

    const ctx = {
      data,
      pubEvent,
    };

    ctx.data = await state.middlewares(ctx);

    const subEventsIter = subEvents.keys();

    let subEventItem = subEventsIter.next();
    while (!subEventItem.done) {
      const subEvent = subEventItem.value;

      let eventHandlers = state.subscribers[subEvent];

      if (!eventHandlers) {
        subEvents.delete(subEvent);
      } else {
        // loop through the entire dll chain
        while (eventHandlers = eventHandlers.getNext()) {
          // use new ctx for every pipeline because
          // one pipeline must never affect the other
          // except middleware pipeline, else it gets
          // difficult to debug
          eventHandlers.meta.handlers(Object.assign({}, ctx));
        }
      }

      subEventItem = subEventsIter.next();
    }
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
