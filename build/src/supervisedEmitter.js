"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_lfu_cache_1 = __importDefault(require("node-lfu-cache"));
const dll_1 = __importDefault(require("./dll"));
const logger_1 = __importDefault(require("./logger"));
const pattern_1 = require("./pattern");
const threadRunner_1 = __importDefault(require("./threadRunner"));
const utils_1 = require("./utils");
exports.compose = utils_1.compose;
exports.pipe = utils_1.pipe;
/**
 * SupervisedEmitter is an event emitter library
 * which supports middlewares, event-tracing, glob subscriptions etc
 *
 * It's main applications can be found in
 * State management (React, Vue etc)
 */
class SupervisedEmitter {
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
    constructor(middlewares, options) {
        this.state = this.getFreshState();
        this.logger = new logger_1.default(logger_1.default.LEVEL.DEBUG, false);
        // Pre-compiling regex for efficiency
        this.scopeReg = new RegExp('^__scope_[0-9]+_/(.+)$');
        const { debug = false, lfu = { max: 100 }, publishConcurrency = 100, } = options || {};
        this.logger[debug ? 'enable' : 'disable']();
        this.state.debug = debug;
        this.state.middlewares = middlewares
            ? utils_1.pipe(...middlewares)
            : this.state.middlewares;
        this.state.subEventsCache = new node_lfu_cache_1.default(lfu);
        this.threadRunner = threadRunner_1.default(this.publisher.bind(this), { maxRunners: publishConcurrency });
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
    subscribe(event, ...handlers) {
        event = pattern_1.sanitizeEvent(event);
        // Check if this is a new or existing event
        if (!this.state.subscribers.get(event)) {
            // Cache has to be updated if the
            // new pattern event matches with the
            // publish event in cache
            if (pattern_1.isPatternEvent(event)) {
                this.addPatternEventToCache(event);
                this.state.patternEvents.push(event);
            }
            else {
                this.addNormalEventToCache(event);
            }
            this.state.subscribers.set(event, new dll_1.default());
        }
        // We're using dll for maintaining a list
        // of handlers for the ease of removing
        // handlers during unsubscription without
        // having to create a new array each time
        // by means of splicing
        const eventHandler = this.state.subscribers.get(event).append({
            // Compose all the subscribers passed at once.
            // Users can use this feature if needed, else
            // can choose to go with the classical approach
            // of subscribing as many times as the handlers.
            pipeline: utils_1.pipe(...handlers),
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
            subscribe(cEvent, ...cHandlers) {
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
    publish(pubEvent, data) {
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
    getScope() {
        const rand = this.state.scopeId++;
        return (event) => `__scope_${rand}_/${event}`;
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
    unScope(event) {
        const match = event.match(this.scopeReg);
        return match ? match[1] : event;
    }
    /**
     * Returns a fresh / new checkout of
     * state
     */
    getFreshState() {
        return {
            debug: false,
            middlewares: ({ data }) => data,
            subscribers: new Map(),
            patternEvents: [],
            subEventsCache: new node_lfu_cache_1.default({}),
            scopeId: 0,
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
    addPatternEventToCache(patternEvent) {
        this.state.subEventsCache.forEach((cachedEvents, pubEvent) => {
            if (pattern_1.doesPatternMatch(pubEvent, patternEvent)) {
                cachedEvents.set(patternEvent, true);
            }
        });
    }
    /**
     * Checks if the matching pubEvent is present
     * in the cache, if so then it adds this event
     *
     * @param event Normal event (w/o pattern)
     */
    addNormalEventToCache(event) {
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
    unsubscribe(subEvent, eventHandler) {
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
    getSubEvents(pubEvent) {
        let subEvents = this.state.subEventsCache.get(pubEvent);
        if (!subEvents) {
            const matchingEvents = new Map();
            // if normal event subscribers are present
            // then add it as well
            if (this.state.subscribers.get(pubEvent)) {
                matchingEvents.set(pubEvent, true);
            }
            // Check if any pattern matches pubEvent
            this.state.patternEvents.forEach((pattern) => {
                if (pattern_1.doesPatternMatch(pubEvent, pattern)) {
                    matchingEvents.set(pattern, true);
                }
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
    publisher(pubEvent, data) {
        return __awaiter(this, void 0, void 0, function* () {
            pubEvent = pattern_1.sanitizeEvent(pubEvent);
            const subEvents = this.getSubEvents(pubEvent);
            const subEventsArr = utils_1.getKeys(subEvents);
            const ctx = {
                data,
                pubEvent,
                subEvents: subEventsArr,
            };
            ctx.data = yield this.state.middlewares(ctx);
            return Promise.all(subEventsArr.map((subEvent) => __awaiter(this, void 0, void 0, function* () {
                // Subscription pipelines
                const subPipelines = this.state.subscribers.get(subEvent);
                if (!subPipelines) {
                    subEvents.delete(subEvent);
                    return null;
                }
                const pipelinePromises = subPipelines.map(({ pipeline }) => __awaiter(this, void 0, void 0, function* () {
                    // use new ctx for every pipeline because
                    // one pipeline must never affect the other
                    // except middleware pipeline, else it gets
                    // difficult to debug
                    return pipeline(Object.assign({}, ctx));
                }));
                return Promise.all(pipelinePromises);
            })));
        });
    }
}
exports.default = SupervisedEmitter;
//# sourceMappingURL=supervisedEmitter.js.map