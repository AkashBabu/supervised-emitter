import LFU from 'node-lfu-cache';

import DLL, { DLLItem } from './dll';
import Logger from './logger';
import { doesPatternMatch, isPatternEvent, sanitizeEvent } from './pattern';
import ThreadRunner, { IRunTask } from './threadRunner';
import { compose, getKeys, pipe } from './utils';

export type IHandler = (ctx: IContext, ...args: any[]) => any;

/**
 * Context object that will be passed as the seconds argument
 * to subscribers and first argument to middlewares
 */
export interface IContext {
  /** Published data */
  data: any;

  /** Published event */
  pubEvent: string;

  /** Matching subscribed events */
  subEvents: string[];

  /** Function to stop the pipeline */
  end?: IEnd;

  /**
   * Any other properties that the middleware desires
   * to add to context
   */
  [newProp: string]: any;
}

/** Function signature of `end` property in [[IContext]] */
export type IEnd = (data: any) => any;

/** Function signature of middlewares */
type IMiddleware = (ctx: IContext) => void;

/** Options to be passed to the constructor */
interface IOptions {
  debug?: boolean;
  lfu?: object;
  publishConcurrency?: number;
}

/** SupervisedEmitter's interface */
interface ISupervisedEmitter {
  publish(pubEvent: string, data: any): Promise<any>;
  subscribe(event: string, ...handlers: IHandler[]): ISubscription;
  getScope(): IGetScope;
  unScope(event: string): string;
}

/**
 * `.subscribe()` method's interface.
 * It's interesting to note that this indicates
 * a possibility of chaining multiple subscriptions.
 */
interface ISubscription {
  unsubscribe(): void; // for unsubscribing from the event
  subscribe(event: string, ...handlers: IHandler[]): ISubscription; // for chaining multiple subscriptions
}

/**
 * @hidden
 */
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

/**
 * Closure function that can add scope
 * to the provide event
 *
 * @param event Event
 */
type IGetScope = (event: string) => string;

/**
 * SupervisedEmitter is an event emitter library
 * which supports middlewares, event-tracing, glob subscriptions etc
 *
 * It's main applications can be found in
 * State management (React, Vue etc)
 */
export default class SupervisedEmitter implements ISupervisedEmitter {
  private state: IState = this.getFreshState();
  private logger = new Logger(Logger.LEVEL.DEBUG, false);

  // ThreadRunner to run publish pipelines from task queue
  private threadRunner: IRunTask;

  // Pre-compiling regex for efficiency
  private scopeReg = new RegExp('^__scope_[0-9]+_/(.+)$');

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
  constructor(middlewares?: IMiddleware[], options?: IOptions) {
    const {
      debug = false,
      lfu = { max: 100 },
      publishConcurrency = 100,
    } = options || {};
    this.logger[debug ? 'enable' : 'disable']();

    this.state.debug = debug;
    this.state.middlewares = middlewares
      ? pipe(...middlewares)
      : this.state.middlewares;
    this.state.subEventsCache = new LFU(lfu);

    this.threadRunner = ThreadRunner(
      this.publisher.bind(this),
      { maxRunners: publishConcurrency },
    );

    this.logger.debug('INITIALIZED');
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

      this.state.subscribers.set(event, new DLL());
    }

    // We're using dll for maintaining a list
    // of handlers for the ease of removing
    // handlers during unsubscription without
    // having to create a new array each time
    // by means of splicing
    const eventHandler = (this.state.subscribers.get(event) as DLL).append({
      // Compose all the subscribers passed at once.
      // Users can use this feature if needed, else
      // can choose to go with the classical approach
      // of subscribing as many times as the handlers.
      pipeline: pipe(...handlers),
    });

    this.logger.debug(`SUBSCRIBED => ${event}`);

    const self = this;
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
        const subscription = self.subscribe(cEvent, ...cHandlers);
        const thisSubscription = this;

        return {
          subscribe: subscription.subscribe,
          unsubscribe() {
            thisSubscription.unsubscribe();
            subscription.unsubscribe();
          },
        };
      },
    };
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
  public publish(pubEvent: string, data: any): Promise<any> {
    return this.threadRunner(pubEvent, data);
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
   * SE.subscribe(scope('asdf/asdf/asdf'), ({data}) => {
   *   // ...
   * });
   *
   * <ChildComponent scope={scope} />
   *
   *
   * /// In ChildComponent.jsx
   * SE.publish(this.props.scope('asdf/asdf/asdf'),  data)
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
  private addPatternEventToCache(patternEvent: string) {
    this.state.subEventsCache.forEach((cachedEvents: Map<string, boolean>, pubEvent: string) => {
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
    const matchingEvents: Map<string, boolean> | null = this.state.subEventsCache.peek(event);

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
  private unsubscribe(subEvent: string, eventHandler: DLLItem) {
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
    const subEventsArr = getKeys(subEvents);

    const ctx = {
      data,
      pubEvent,
      subEvents: subEventsArr,
    };

    ctx.data = await this.state.middlewares(ctx);

    return Promise.all(subEventsArr.map<Promise<any>>(async (subEvent: string) => {
      // Subscription pipelines
      const subPipelines = this.state.subscribers.get(subEvent);

      if (!subPipelines) {
        subEvents.delete(subEvent);
        return null;
      }

      const pipelinePromises = subPipelines.map<Promise<any>>(async ({ pipeline }) => {
        // use new ctx for every pipeline because
        // one pipeline must never affect the other
        // except middleware pipeline, else it gets
        // difficult to debug
        return pipeline({ ...ctx });
      });

      return Promise.all(pipelinePromises);
    }));
  }
}

export {
  pipe,
  compose,
};
