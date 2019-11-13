import DLL from './dll';
export declare type IHandler = (ctx: IContext, ...args: any[]) => any;
/**
 * Context object that will be passed as the second argument
 * to subscribers and first argument to middlewares
 */
export interface IContext {
    /**
     * Data that was published.
     * Since data is piped through the middleware
     * pipeline and then through all subscription
     * pipeline, this might NOT be the same as
     * published.
     */
    data: any;
    /**
     * Published event.
     * This information can be used in middlewares to
     * maintain a stack of event that were published in
     * the system and the same can be used to reproduce
     * a bug.
     */
    pubEvent: string;
    /**
     * All subEvents that match the pubEvent.
     * Note that even if multiple pipelines are hooked
     * to the same subEvent, this Array would include it
     * only once. So NO duplicate event will be found in
     * subEvents.
     */
    subEvents: string[];
    /**
     * This promise will be resolved when the pipeline
     * has completed execution. This can be very useful
     * in situation wherein the user wants execute some action
     * when this pipeline has been completed irrespective of
     * whether it is stopped in between or has completed the pipeline.
     * In fact, same technique was used to create subscribeOnce
     * feature as well.
     *
     * Note: User MUST NOT await on this promise, instead `then`
     * must be used because if awaited, it would wait for Infinite time
     * as it results in a circular dependent promise.
     */
    pipelinePromise?: Promise<any>;
    /**
     * Any other properties that the middleware/subscription
     * pipeline desires to add to the context. This technique
     * can be used to create methods like printEventTrace, onEnd etc
     */
    [newProp: string]: any;
}
/** Function signature of middlewares */
export declare type IMiddleware = (ctx: IContext) => Promise<any> | any;
/** Options to be passed to the constructor */
export interface IOptions {
    debug?: boolean;
    lfu?: object;
    publishConcurrency?: number;
    lifeCycleEvents?: boolean;
}
/** SupervisedEmitter's interface */
export interface ISupervisedEmitter {
    /** Subscribes to an event */
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
    /** Subscribes to an event only once */
    subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription;
    /** Publishes data on the given pubEvent */
    publish(pubEvent: string, data: any): Promise<any>;
    /** Returns a Closure function that adds scope to an event */
    getScope(): IGetScope;
    /** This strips the scope part in the given event */
    unScope(event: string): string;
}
/**
 * `.subscribe()` method's interface. Since this interface
 * return [[ISubscription]] on subscribe|subscribeOnce, you may
 * chain as many subscriptions as needed and all the chained
 * subscription can be unsubscribed by running unsubscription
 * just once on the final subscription returned.
 *
 * **Example**
 * ```TS
 * const subscription = SE.subscribe('foo/bar', () => {})
 *                        .subscribe('hello/world', () => {});
 *
 * subscription.unsubscribe();
 * ```
 */
export interface ISubscription {
    unsubscribe(): void;
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
    subscribeOnce(event: string, ...handlers: IHandler[]): ISubscription;
}
/**
 * @hidden
 */
export interface IState {
    /**
     * When set to true, SE publishes life-cycle
     * events like => init, onSubscribe & onUnsubscribe
     */
    lifeCycleEvents: boolean;
    /**
     * When true, debug logs are printed to console
     */
    debug: boolean;
    middlewares: IMiddleware;
    subscribers: Map<string, DLL>;
    patternEvents: string[];
    subEventsCache: any;
    scopeId: number;
}
/**
 * Closure function that can add scope
 * to the provide event
 *
 * @param event Event
 */
export declare type IGetScope = (event: string) => string;
