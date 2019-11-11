/**
 * Suffixes internal event part
 * to the given event
 *
 * @param ev Event
 */
const internalEvent = (ev: string) => `__int_ev__/${ev}`;

interface IInternalEvents {
  [prop: string]: string;
}
const InternalEvents: IInternalEvents = {
  ON_INIT: internalEvent('INIT'),
  ON_SUBSCRIBE: internalEvent('ON_SUBSCRIBE'),
  ON_UNSUBSCRIBE: internalEvent('ON_UNSUBSCRIBE'),
};

export default InternalEvents;
