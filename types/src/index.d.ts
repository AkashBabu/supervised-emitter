import DLL from './dll';
import { compose, pipe } from './utils';
export declare type IHandler = (ctx: IContext, ...args: any[]) => any;
export interface IContext {
    data: any;
    pubEvent?: string;
    subEvents?: string[];
    end?: IEnd;
    [newProp: string]: any;
}
declare type IEnd = (data: any) => any;
declare type IMiddleware = (ctx: IContext) => void;
interface IOptions {
    debug?: boolean;
    lfu?: object;
}
interface ISupervisedEmitter {
    displayName: string;
    state: IState;
    initialize(middlewares?: IMiddleware[], options?: IOptions): void;
    reset(): void;
    publish(pubEvent: string, data: any): Promise<any>;
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
    getScope(): IGetScope;
    unScope(event: string): string;
}
interface ISubscription {
    unsubscribe(): void;
    subscribe(event: string, ...handlers: IHandler[]): ISubscription;
}
interface IState {
    debug: boolean;
    middlewares: IMiddleware;
    subscribers: Map<string, DLL>;
    patternEvents: string[];
    subEventsCache: any;
    scopeId: number;
}
declare type IGetScope = (event: string) => string;
/**
 * SupervisedEmitter
 * It's a singleton of event emitter which supports
 * middlewares, event-tracing etc
 *
 * It's main applications can be found in
 * State management (React, Vue etc)
 * and nodejs for worker model
 */
declare const SupervisedEmitter: ISupervisedEmitter;
export { pipe, compose, };
export default SupervisedEmitter;
