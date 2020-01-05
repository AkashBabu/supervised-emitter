/**
 * Interface for internal-events
 */
export interface IInternalEvents {
    /**
     * This event is published when Supervised-Emitter
     * instance is created and setup is done
     */
    ON_INIT: string;
    /**
     * This event will be published everytime a new
     * subscription is made
     */
    ON_SUBSCRIBE: string;
    /**
     * This event will be published everytime an
     * unsubscription an any topic is mode
     */
    ON_UNSUBSCRIBE: string;
    /**
     * This event will be published everytime an
     * error occurs during publish cycle. Users shall
     * subscribe to this topic to understand the error
     * and push the same to error tracking systems like
     * Sentry, Fabric or the like.
     */
    ON_ERROR: string;
}
/**
 * @hidden
 *
 * Holds all the topics for internal-events
 * such as on init,subscribe,unsubscribe&error
 */
export declare const InternalEvents: IInternalEvents;
/**
 * @hidden
 *
 * This reverse mapping of topic to internal event
 * is used as a predicate to check if the given topic is
 * an internal event or not
 */
export declare const InternalEventsRev: {
    [prop: string]: string;
};
