import LFU from 'node-lfu-cache';

import DLL, { DLLItem } from './dll';
import { SingletonError } from './errors';
import Logger from './logger';
import { doesPatternMatch, isPatternEvent, sanitizeEvent } from './pattern';
import ThreadRunner, { IRunTask } from './threadRunner';
import { compose, getKeys, pipe } from './utils';

export type IHandler = (ctx: IContext, ...args: any[]) => any;

export interface IContext {
  // Published data
  data: any;

  // Published event
  pubEvent?: string;

  // Matching subscribed events
  subEvents?: string[];

  // Function to stop the pipeline
  end?: IEnd;

  [newProp: string]: any;
}

type IEnd = (data: any) => any;

type IMiddleware = (ctx: IContext) => void;

interface IOptions {
  debug?: boolean;
  lfu?: object;
}

interface ISupervisedEmitter {
  displayName: string;

  state: IState;
  initialize(middlewares?: IMiddleware[], options?: IOptions): void;

  // Resets the Singleton
  reset(): void;

  publish(pubEvent: string, data: any): Promise<any>;
  subscribe(event: string, ...handlers: IHandler[]): ISubscription;
  getScope(): IGetScope;
  unScope(event: string): string;
}

interface ISubscription {
  unsubscribe(): void; // for unsubscribing from the event
  subscribe(event: string, ...handlers: IHandler[]): ISubscription; // for chaining multiple subscriptions
}

interface IState {
  debug: boolean;

  // List of middlewares
  middlewares: IMiddleware;

  // map of event vs pipelines (DLL)
  subscribers: Map<string, DLL>;

  // list of pattern events
  patternEvents: string[];

  // cache for maintaining pubEvents vs matching subEvents
  subEventsCache: any;

  // use to generate a new scope part
  scopeId: number;
}

type IGetScope = (event: string) => string;

/**
 * SupervisedEmitter
 * It's a singleton of event emitter which supports
 * middlewares, event-tracing etc
 *
 * It's main applications can be found in
 * State management (React, Vue etc)
 * and nodejs for worker model
 */
const SupervisedEmitter: ISupervisedEmitter = ((): ISupervisedEmitter => {
  const logger = new Logger(Logger.LEVEL.DEBUG, false);

  // Flag used to check for singleton
  let initialized: boolean = false;

  // This is used to maintain the context
  // throughout the singleton
  let state = getFreshState();

  // ThreadRunner to run publish pipelines from task queue
  const threadRunner: IRunTask = ThreadRunner(publisher, { maxRunners: 100 });

  /**
   * Initializes a singleton of SupervisedEmitter
   *
   * @param {Handler[]} middlewares array of middlewares
   * @param {Options} options
   */
  function initialize(middlewares?: IMiddleware[], options?: IOptions): void {
    if (initialized) {
      throw new SingletonError();
    }
    initialized = true;

    const { debug = false, lfu = { max: 100 } } = options || {};
    logger[debug ? 'enable' : 'disable']();

    state.debug = debug;
    state.middlewares = middlewares
      ? pipe(...middlewares)
      : ({ data }) => data;
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
  function getFreshState(): IState {
    return {
      debug: false,
      middlewares: ({ data }: IContext) => data,
      subscribers: new Map(), // map of event vs pipelines (DLL)
      patternEvents: [], // list of pattern events
      subEventsCache: new LFU({}), // cache for maintaining pubEvents vs matching subEvents
      scopeId: 0, // use to generate a new scope part
    };
  }

  /**
   * Goes through every publish event in cache
   * and checks if it matches the given patterns
   * and if match found, then add this pattern
   * to cached events
   *
   * @param patternEvent Pattern event
   */
  const addPatternEventToCache = (patternEvent: string) => {
    state.subEventsCache.forEach((cachedEvents: Map<string, boolean>, pubEvent: string) => {
      if (doesPatternMatch(pubEvent, patternEvent)) { cachedEvents.set(patternEvent, true); }
    });
  };

  /**
   * Checks if the matching pubEvent is present
   * in the cache, if so then it adds this event
   *
   * @param event Normal event (w/o pattern)
   */
  const addNormalEventToCache = (event: string) => {
    const matchingEvents: Map<string, boolean> | null = state.subEventsCache.peek(event);

    if (matchingEvents instanceof Map) {
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
   * @returns Subscription for chaining more subscriptions or
   *    for unsubscribing from all the subscriptions
   */
  const subscribe = (event: string, ...handlers: IHandler[]): ISubscription => {
    event = sanitizeEvent(event) as string;

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
    const eventHandler = (state.subscribers.get(event) as DLL).append({
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
       * @param cEvent Subscription event
       * @param cHandlers List of handlers
       *
       * @returns Subscription for subscribing and unsubscribing fron
       *  the chained subscriptions
       */
      subscribe(cEvent: string, ...cHandlers: IHandler[]): ISubscription {
        const subscription = subscribe(cEvent, ...cHandlers);
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
   * @param subEvent Subscribed Event
   * @param eventHandler Handler pipeline
   */
  const unsubscribe = (subEvent: string, eventHandler: DLLItem) => {
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
   * @param pubEvent Publish event
   *
   * @returns map of matching patterns vs state
   */
  const getSubEvents = (pubEvent: string): Map<string, boolean> => {
    let subEvents = state.subEventsCache.get(pubEvent);

    if (!subEvents) {
      const matchingEvents: Map<string, boolean> = new Map();

      // if normal event subscribers are present
      // then add it as well
      if (state.subscribers.get(pubEvent)) {
        matchingEvents.set(pubEvent, true);
      }

      // Check if any pattern matches pubEvent
      state.patternEvents.forEach((pattern) => {
        if (doesPatternMatch(pubEvent, pattern)) { matchingEvents.set(pattern, true); }
      });

      state.subEventsCache.set(pubEvent, matchingEvents);

      subEvents = matchingEvents;
    }

    return subEvents;
  };

  /**
   * Adds the publish task to publisher queue
   *
   * @param pubEvent Event to publish the given data
   * @param data Any data that need to be published
   *
   * @returns awaitable publish
   */
  const publish = async (pubEvent: string, data: any): Promise<any> => {
    try {
      const result = await threadRunner(pubEvent, data);

      logger.debug(`PUBLISHED => ${pubEvent}`, data)
      return result;
    } catch (error) {
      logger.error('Error while publishing event:', pubEvent, data);
    }
  };

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
   * @param pubEvent Event to publish the given data
   * @param data Any data that need to be published
   *
   * @returns Promise that resolves after publish pipeline completion
   */
  async function publisher(pubEvent: string, data: any): Promise<any> {
    pubEvent = sanitizeEvent(pubEvent) as string;

    const subEvents = getSubEvents(pubEvent);
    const subEventsArr = getKeys(subEvents);

    const ctx = {
      data,
      pubEvent,
      subEvents: subEventsArr,
    };

    ctx.data = await state.middlewares(ctx);

    return Promise.all(subEventsArr.map(async (subEvent: string) => {
      const eventHandlers = state.subscribers.get(subEvent);

      if (!eventHandlers) {
        subEvents.delete(subEvent);
        return null;
      }

      const handlingSubscribers: Array<Promise<any>> = [];

      eventHandlers.forEach(({ handlers }) => {
        // use new ctx for every pipeline because
        // one pipeline must never affect the other
        // except middleware pipeline, else it gets
        // difficult to debug
        handlingSubscribers.push(handlers({ ...ctx }));
      });

      return Promise.all(handlingSubscribers);
    }));
  }

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
   * @returns function that can add scope to events
   */
  function getScope(): IGetScope {
    const rand = state.scopeId++;
    return (event: string) => `__scope_${rand}_/${event}`;
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
   * @param event Scoped event
   *
   * @returns event without scope
   */
  function unScope(event: string): string {
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
    state,
  };
})();

export {
  pipe,
  compose,
};

export default SupervisedEmitter;
