import patternHandler from './patternHandler';
import { IInternalEvents } from './internalEvents';
import { ISupervisedEmitter, IGetScope, IMiddleware, IHandler, IOptions, ISubscription } from './interfaces';
/**
 * SupervisedEmitter is an event emitter library
 * which supports middlewares, event-tracing, glob subscriptions etc
 *
 * It's main applications can be found in
 * State management, sagas, communication between
 * component irrespective of whereever it is in the DOM tree
 */
export default class SupervisedEmitter implements ISupervisedEmitter {
    static patternHandler: typeof patternHandler;
    static InternalEvents: IInternalEvents;
    private state;
    private logger;
    private taskQueue;
    private scopeReg;
    private options;
    private middlewares;
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
    subscribeOnce(event: string, ...handlers: IHandler[]): Promise<any>;
    /**
     * Waits untill the required event is received.
     * This is especially useful when writing flows of
     * execution.
     *
     * **Example**
     * In a request life-cycle
     * if some action needs to be take post a response
     * has been received, then it can be written as follow
     * ```JS
     * SE.publish('req/profiles/load')
     * await SE.waitTill('req/profiles/success')
     *
     * SE.publish('req/profiles/sort')
     * ```
     *
     * @param event Subscription event
     *
     * @returns a Promise that resolves to data
     */
    waitTill(event: string): Promise<any>;
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
    publish(pubEvent: string, data?: any): Promise<any>;
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
    private publishInternalEvents;
    /**
     * Predicate for determining whether the given
     * event is internal event or not
     *
     * @param event event to be checked for internal event
     *
     * @returns true if the given event is internal event
     */
    private isInternalEvent;
}
