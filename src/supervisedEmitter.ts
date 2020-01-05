import LFUCache from '@akashbabu/lfu-cache';
import { DLL, DLLItem } from '@akashbabu/node-dll';
import Logger from './lib/logger';
import { doesPatternMatch, isPatternEvent, sanitizeEvent } from './pattern';
import TaskQueue, { ITaskQueue } from './lib/taskQueue';
import { pipe } from './lib/pipe';
import getMapKeys from './lib/getMapKeys';
import patternHandler from './patternHandler';
import {InternalEvents, InternalEventsRev, IInternalEvents} from './internalEvents';

import {
  ISupervisedEmitter, IState, IGetScope, IMiddleware,
  IHandler, IOptions, ISubscription, ISubPipeline, IOptionsInt,
} from './interfaces';
import mergeOptions from './lib/mergeOptions';

/**
 * SupervisedEmitter is an event emitter library
 * which supports middlewares, event-tracing, glob subscriptions etc
 *
 * It's main applications can be found in
 * State management, sagas, communication between
 * component irrespective of whereever it is in the DOM tree
 */
export default class SupervisedEmitter implements ISupervisedEmitter {
  public static patternHandler = patternHandler;
  public static InternalEvents: IInternalEvents = InternalEvents;

  private state: IState;
  private logger = new Logger(Logger.LEVEL.DEBUG, false);

  // ThreadRunner to run publish pipelines from task queue
  private taskQueue: ITaskQueue<Promise<any>>;

  // Pre-compiling regex for efficiency
  private scopeReg = new RegExp('^__scope_[0-9]+_/(.+)$');

  // Options for internal usage after merging the default options
  private options: IOptionsInt;

  // Middlewares
  private middlewares: IMiddleware;

  /**
   * Creates a new instance of SupervisedEmitter
   *
   * **Example**
   *
   * Initializing with no middlewares:
   * ```JS
   * import SupervisedEmitter from 'supervised-emitter';
   *
   * const SE = new SupervisedEmitter();
   * ```
   *
   * Initializing with middlewares and options:
   * ```JS
   * const SE = new SupervisedEmitter(
   *   [eventTraceMiddleware],
   *   {debug: true, lfu: {max: 50}}
   * );
   * ```
   *
   * @param middlewares List of middlewares. Remember that all these
   *     middlewares will be piped to form a pipeline. i.e. the output of
   *     each of the middleware is passed in `data`(in the context) to the next
   *     middleware in the pipeline (top-down execution)
   * @param options Options for debugging and LFU
   */
  constructor(
    middlewares: IMiddleware[] = [({data}) => data],
    options: IOptions = {},
  ) {
    this.middlewares = pipe(...middlewares);

    this.options = mergeOptions(options, {
      debug: false,
      lfu: {
        max: 100,
        evictCount: 10,
        maxAge: 10 * 60 * 1000,
      },
      publishConcurrency: 100,
      lifeCycleEvents: false,
    });

    this.logger[this.options.debug ? 'enable' : 'disable']();

    // initialize state
    this.state = this.getFreshState();

    this.taskQueue = new TaskQueue<Promise<any>>(
      this.publisher.bind(this),
      { maxRunners: this.options.publishConcurrency },
    );

    this.logger.debug('INITIALIZED');

    this.publishInternalEvents(InternalEvents.ON_INIT, {});
  }

  /**
   * Subscribes to a given event and pipes all the
   * handlers passed for this event.
   *
   * Please note that each handler must pass on the
   * data that must be handled by the next handler, as
   * all these handlers will be piped (compose in reverse direction).
   *
   * Chaining subscriptions is also possible. Please see the
   * example below for more details.
   *
   * For more info on `pipe` visit:
   * https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937
   *
   * **Example**
   *
   * ```JS
   * const subscription = SE.subscribe('foo/bar',
   *   ({data}) => {
   *     console.log(data); //=> 1
   *     return data + 1,
   *   },
   *   ({data}) => {
   *     console.log(data); //=> 2
   *   }
   * ).subscribe('foo/*',
   *   ({data}) => console.log(data) //=> 1
   * );
   *
   * await SE.publish('/foo/bar', 1);
   *
   * subscription.unsubscribe();
   * ```
   *
   * @param event Subscription event
   * @param handlers List of handlers
   *
   * @returns Subscription for chaining more subscriptions or
   *    for unsubscribing from all the subscriptions
   */
  public subscribe(event: string, ...handlers: IHandler[]): ISubscription {
    event = sanitizeEvent(event) as string;

    // Check if this is a new or existing event
    if (!this.state.subscribers.get(event)) {
      // Cache has to be updated if the
      // new pattern event matches with the
      // publish event in cache
      if (isPatternEvent(event)) {
        this.addPatternEventToCache(event);
        this.state.patternEvents.push(event);
      } else {
        this.addNormalEventToCache(event);
      }

      this.state.subscribers.set(event, new DLL<ISubPipeline>());
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of splicing
    // handlers during unsubscription
    const eventHandler = (this.state.subscribers.get(event) as DLL<ISubPipeline>).push({
      // Compose all the subscribers passed at once.
      // Users can use this feature if needed, else
      // can choose to go with the classical approach
      // of subscribing as many times as the handlers.
      pipeline: pipe(...handlers),
    });

    this.logger.debug(`SUBSCRIBED => ${event}`);

    // This checks avoid infinite publishing of internal eventss
    if (!this.isInternalEvent(event)) {
      this.publishInternalEvents(InternalEvents.ON_SUBSCRIBE, { subEvent: event });
    }

    const self = this;
    return (() => {
      function chainSubscription(this: any, method: 'subscribe' | 'subscribeOnce',
                                 cEvent: string, ...cHandlers: IHandler[]): ISubscription {
        const subscription = self[method](cEvent, ...cHandlers);
        const prevSubscription = this;

        return {
          ...subscription,
          unsubscribe() {
            prevSubscription.unsubscribe();
            subscription.unsubscribe();
          },
        };
      }

      return {
        /**
         * Unsubscribes from this subscription
         */
        unsubscribe() {
          self.unsubscribe(event, eventHandler);
        },

        /**
         * This method allows chaining subscription to
         * multiple events via the same subscription
         */
        subscribe(cEvent: string, ...cHandlers: IHandler[]): ISubscription {
          return chainSubscription.call(this, 'subscribe', cEvent, ...cHandlers);
        },

        /**
         * This method allows chaining subscription to
         * multiple events via the same subscription
         */
        subscribeOnce(cEvent: string, ...cHandlers: IHandler[]): ISubscription {
          return chainSubscription.call(this, 'subscribeOnce', cEvent, ...cHandlers);
        },
      };
    })();
  }

  /**
   * Similar to [[subscribe]], but it listens only to
   * the first event and unsubscribes itself thereafter.
   *
   * **Example**
   *
   * ```JS
   * let calls = 0;
   * const subscription = SE.subscribeOnce('foo/bar', () => calls++)
   *
   * await SE.publish('/foo/bar', 'test');
   * await SE.publish('/foo/bar', 'test');
   *
   * console.log(calls) //=> 1
   *
   * subscription.unsubscribe();
   * ```
   *
   * @param event Subscription event
   * @param handlers List of handlers
   *
   * @returns Subscription for chaining more subscriptions or
   *    for unsubscribing from all the subscriptions
   */
  public subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription {
    const subscription = this.subscribe(event, ({ pipelinePromise, data }) => {
      (pipelinePromise as Promise<any>).then(subscription.unsubscribe).catch(subscription.unsubscribe);

      return data;
    }, ...handlers);

    this.logger.debug(`SUBSCRIBED_ONCE => ${event}`);

    return subscription;
  }

  /**
   * Publishes the given event to all the matching
   * subscribers.
   *
   * NOTE: This is an asynchronous call, so if you want to
   * publish events one after the other, then you will have
   * to `await` on each publish call.
   * Please see the example below for more details.
   *
   * **Example**
   *
   * Simple publish (fire and forget):
   * ```JS
   * SE.publish('foo/bar', 1);
   *
   * SE.publish('foo/bar', 'hello world');
   * ```
   *
   * Publish one after the other (execute all the subscription pipelines before moving to next publish):
   * ```JS
   * await SE.publish('publish/first', 'first');
   *
   * // This will be published only after all the
   * // matching subscription pipelines of the above
   * // publish events have been completed
   * await SE.publish('publish/second', 'second');
   * ```
   *
   * @param pubEvent Event to publish the given data
   * @param data Any data that need to be published
   *
   * @returns Awaitable publish
   */
  public publish(pubEvent: string, data: any = null): Promise<any> {
    return this.taskQueue.add(pubEvent, data);
  }

  /**
   * Adds scope to a event by prefixing
   * it with a incrementing counter string(__scope_<counter>_/),
   * such that everytime this is called the
   * subscribers can listen only on scoped events.
   * This is especially useful when you don't want
   * other subscribers to listen to this event.
   * Then this behaves more like a camouflage event,
   * which is visible only to scoped subscribers.
   *
   * This is especially useful when multiple
   * instances of the same class is listening and
   * is interested only in events of its own instance.
   *
   * **Example**
   *
   * In React, if you're using the same component in
   * multiple places but your actions(Show popup, make a request etc)
   * are different in each place, then you may achieve it like this:
   * ```JSX
   * /// container.jsx
   * const [{scope}] = useState({scope: SE.getScope()});
   *
   * SE.subscribe(scope('btn/click'), ({data}) => {
   *   // ...
   * });
   *
   * <ChildComponent scope={scope} />
   *
   *
   * /// In ChildComponent.jsx
   * SE.publish(this.props.scope('btn/click'),  data)
   * ```
   *
   * @returns Function(Closure) that can add scope to events
   */
  public getScope(): IGetScope {
    const rand = this.state.scopeId++;
    return (event: string) => `__scope_${rand}_/${event}`;
  }

  /**
   * Strips out the scope part in the given
   * scoped event.
   *
   * i.e, it converts __scope_<number>_/foo/bar => foo/bar
   *
   * This method can be used in your middlewares
   * to unshell the scope part in the topic and run
   * your logics.
   *
   * @param event Scoped event
   *
   * @returns Event without scope part
   */
  public unScope(event: string): string {
    const match = event.match(this.scopeReg);

    return match ? match[1] : event;
  }

  /**
   * Returns a fresh / new checkout of
   * state
   */
  private getFreshState(): IState {
    return {
      subscribers: new Map(), // map of event vs pipelines (DLL)
      patternEvents: [], // list of pattern events
      subEventsCache: new LFUCache(this.options.lfu), // cache for maintaining pubEvents vs matching subEvents
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
  private addPatternEventToCache(patternEvent: string) {
    this.state.subEventsCache.forEach(([pubEvent, cachedEvents]) => {
      if (doesPatternMatch(pubEvent, patternEvent)) { cachedEvents.set(patternEvent, true); }
    });
  }

  /**
   * Checks if the matching pubEvent is present
   * in the cache, if so then it adds this event
   *
   * @param event Normal event (w/o pattern)
   */
  private addNormalEventToCache(event: string) {
    const matchingEvents = this.state.subEventsCache.peek(event);

    if (matchingEvents instanceof Map) {
      matchingEvents.set(event, true);
    }
  }

  /**
   * Unsubscribes the event pipeline from the event
   *
   * @param subEvent Subscribed Event
   * @param eventHandler Handler pipeline
   */
  private unsubscribe(subEvent: string, eventHandler: DLLItem<ISubPipeline>) {
    // This checks avoid infinite publishing of internal events
    if (!this.isInternalEvent(subEvent)) {
      this.publishInternalEvents(InternalEvents.ON_UNSUBSCRIBE, { subEvent });
    }

    const subscribers = this.state.subscribers.get(subEvent);
    // remove the handler from DLL
    if (subscribers) {
      subscribers.remove(eventHandler);

      // If there are no event pipelines
      // for this event, then remove the event from
      // subscribers list (for space optimization).
      if (subscribers.length === 0) {
        this.state.subscribers.delete(subEvent);
      }
    }

    this.logger.debug(`UNSUBSCRIBED => ${subEvent}`);
  }

  /**
   * Returns all the matching subscribed events
   * given publish event (including glob pattern)
   *
   * This is the place where you can optimize the
   * matching logic by caching the matched events.
   *
   * @param pubEvent Publish event
   *
   * @returns map of matching patterns vs this.state
   */
  private getSubEvents(pubEvent: string): Map<string, boolean> {
    let subEvents = this.state.subEventsCache.get(pubEvent);

    if (!subEvents) {
      const matchingEvents: Map<string, boolean> = new Map();

      // if normal event subscribers are present
      // then add it as well
      if (this.state.subscribers.get(pubEvent)) {
        matchingEvents.set(pubEvent, true);
      }

      // Check if any pattern matches pubEvent
      this.state.patternEvents.forEach((pattern) => {
        if (doesPatternMatch(pubEvent, pattern)) { matchingEvents.set(pattern, true); }
      });

      this.state.subEventsCache.set(pubEvent, matchingEvents);

      subEvents = matchingEvents;
    }

    return subEvents;
  }

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
  private async publisher(pubEvent: string, data: any): Promise<any> {
    pubEvent = sanitizeEvent(pubEvent) as string;

    const subEvents = this.getSubEvents(pubEvent);
    const subEventsArr = getMapKeys(subEvents);

    const ctx = {
      data,
      pubEvent,
      subEvents: subEventsArr,
    };

    const result = await this.middlewares(ctx);

    // If the flow was stopped in the middlewares
    // then end it w/o passing the data to any of
    // the subscription pipelines
    if (result === undefined) {
      return;
    }

    ctx.data = result;

    return Promise.all(subEventsArr.map<Promise<any>>(async (subEvent: string) => {
      // Subscription pipelines
      const subPipelines = this.state.subscribers.get(subEvent);

      // lazy pruning of removed subscription pipelines
      if (!subPipelines) {
        subEvents.delete(subEvent);
        return null;
      }

      const pipelinePromises = subPipelines.map<Promise<any>>(async ({ pipeline }) => {
        try {
          // use new ctx for every pipeline because
          // one pipeline must never affect the other
          // except middleware pipeline, else it gets
          // difficult to debug
          const output = await pipeline({ ...ctx });
          return output;
        } catch (error) {
          this.logger.error('Error during publish:', error);
          this.publishInternalEvents(InternalEvents.ON_ERROR, {error});
        }
      });

      return Promise.all(pipelinePromises);
    }));
  }

  private publishInternalEvents(pubEvent: string, data: any): Promise<any> {
    if (this.isInternalEvent(pubEvent) && this.options.lifeCycleEvents) {
      return this.publish(pubEvent, data);
    }

    return Promise.resolve();
  }

  /**
   * Predicate for determining whether the given
   * event is internal event or not
   *
   * @param event event to be checked for internal event
   *
   * @returns true if the given event is internal event
   */
  private isInternalEvent(event: string): boolean {
    return event in InternalEventsRev;
  }
}
