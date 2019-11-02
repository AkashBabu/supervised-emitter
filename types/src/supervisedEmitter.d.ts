export declare type IHandler = (ctx: IContext, ...args: any[]) => any;
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
export declare type IEnd = (data: any) => any;
/** Function signature of middlewares */
declare type IMiddleware = (ctx: IContext) => void;
/** Options to be passed to the constructor */
interface IOptions {
    debug?: boolean;
    lfu?: object;
    publishConcurrency?: number;
}
/** SupervisedEmitter's interface */
interface ISupervisedEmitter {
    /** Subscribes to an event */
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
    /** Subscribes to an event only once */
    subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription;
    /** Publishes data on the given pubEvent */
    publish(pubEvent: string, data: any): Promise<any>;
    /** Returns a Closure function that adds scope to an event */
    getScope(): IGetScope;
    /** This strip the scope part in the given event */
    unScope(event: string): string;
}
/**
 * `.subscribe()` method's interface.
 * It's interesting to note that this indicates
 * a possibility of chaining multiple subscriptions.
 */
interface ISubscription {
    unsubscribe(): void;
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
    subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription;
}
/**
 * Closure function that can add scope
 * to the provide event
 *
 * @param event Event
 */
declare type IGetScope = (event: string) => string;
/**
 * SupervisedEmitter is an event emitter library
 * which supports middlewares, event-tracing, glob subscriptions etc
 *
 * It's main applications can be found in
 * State management (React, Vue etc)
 */
export default class SupervisedEmitter implements ISupervisedEmitter {
    private state;
    private logger;
    private threadRunner;
    private scopeReg;
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
    constructor(middlewares?: IMiddleware[], options?: IOptions);
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
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
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
    subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription;
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
    publish(pubEvent: string, data: any): Promise<any>;
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
    getScope(): IGetScope;
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
    unScope(event: string): string;
    /**
     * Returns a fresh / new checkout of
     * state
     */
    private getFreshState;
    /**
     * Goes through every publish event in cache
     * and checks if it matches the given patterns
     * and if match found, then add this pattern
     * to cached events
     *
     * @param patternEvent Pattern event
     */
    private addPatternEventToCache;
    /**
     * Checks if the matching pubEvent is present
     * in the cache, if so then it adds this event
     *
     * @param event Normal event (w/o pattern)
     */
    private addNormalEventToCache;
    /**
     * Unsubscribes the event pipeline from the event
     *
     * @param subEvent Subscribed Event
     * @param eventHandler Handler pipeline
     */
    private unsubscribe;
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
    private getSubEvents;
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
    private publisher;
}
export {};
