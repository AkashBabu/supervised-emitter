import { DLL } from '@akashbabu/node-dll';
import LFUCache from '@akashbabu/lfu-cache';
export declare type IHandler = (ctx: IContext, ...args: any[]) => any | Promise<any>;
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
     * in situations wherein the user wants to execute some action
     * when this pipeline has been completed, irrespective of
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
/**
 * @hidden
 *
 * Options interface for internal usage.
 * This was created, since the original IOptions object
 * has a couple of options property which causes `may be undefined`
 * error during usage even after assigning default param to it.
 * Hence this interface solved the problem
 */
export interface IOptionsInt {
    debug: boolean;
    lfu: object;
    publishConcurrency: number;
    lifeCycleEvents: boolean;
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
    subscribers: Map<string, DLL<ISubPipeline>>;
    patternEvents: string[];
    subEventsCache: LFUCache<Map<string, boolean>>;
    scopeId: number;
}
/**
 * Closure function that can add scope
 * to the provide event
 *
 * @param event Event
 */
export declare type IGetScope = (event: string) => string;
export interface ISubPipeline {
    pipeline: IHandler;
}
