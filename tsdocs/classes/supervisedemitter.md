[Supervised-Emitter](../README.md) › [SupervisedEmitter](supervisedemitter.md)

# Class: SupervisedEmitter

SupervisedEmitter is an event emitter library
which supports middlewares, event-tracing, glob subscriptions etc

It's main applications can be found in
State management (React, Vue etc)

## Hierarchy

* **SupervisedEmitter**

## Implements

* [ISupervisedEmitter](../interfaces/isupervisedemitter.md)

## Index

### Constructors

* [constructor](supervisedemitter.md#constructor)

### Methods

* [getScope](supervisedemitter.md#getscope)
* [publish](supervisedemitter.md#publish)
* [subscribe](supervisedemitter.md#subscribe)
* [subscribeOnce](supervisedemitter.md#subscribeonce)
* [unScope](supervisedemitter.md#unscope)

## Constructors

###  constructor

\+ **new SupervisedEmitter**(`middlewares?`: [IMiddleware](../README.md#imiddleware)[], `options?`: [IOptions](../interfaces/ioptions.md)): *[SupervisedEmitter](supervisedemitter.md)*

Creates a new instance of SupervisedEmitter

**Example**

Initializing with no middlewares:
```JS
import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter();
```

Initializing with middlewares and options:
```JS
const SE = new SupervisedEmitter(
  [eventTraceMiddleware],
  {debug: true, lfu: {max: 50}}
);
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`middlewares?` | [IMiddleware](../README.md#imiddleware)[] | List of middlewares. Remember that all these     middlewares will be piped to form a pipeline. i.e. the output of     each of the middleware is passed in `data`(in the context) to the next     middleware in the pipeline (top-down execution) |
`options?` | [IOptions](../interfaces/ioptions.md) | Options for debugging and LFU  |

**Returns:** *[SupervisedEmitter](supervisedemitter.md)*

## Methods

###  getScope

▸ **getScope**(): *[IGetScope](../README.md#igetscope)*

*Implementation of [ISupervisedEmitter](../interfaces/isupervisedemitter.md)*

Adds scope to a event by prefixing
it with a incrementing counter string(__scope_<counter>_/),
such that everytime this is called the
subscribers can listen only on scoped events.
This is especially useful when you don't want
other subscribers to listen to this event.
Then this behaves more like a camouflage event,
which is visible only to scoped subscribers.

This is especially useful when multiple
instances of the same class is listening and
is interested only in events of its own instance.

**Example**

In React, if you're using the same component in
multiple places but your actions(Show popup, make a request etc)
are different in each place, then you may achieve it like this:
```JSX
/// container.jsx
const [{scope}] = useState({scope: SE.getScope()});

SE.subscribe(scope('asdf/asdf/asdf'), ({data}) => {
  // ...
});

<ChildComponent scope={scope} />

/// In ChildComponent.jsx
SE.publish(this.props.scope('asdf/asdf/asdf'),  data)
```

**Returns:** *[IGetScope](../README.md#igetscope)*

Function(Closure) that can add scope to events

___

###  publish

▸ **publish**(`pubEvent`: string, `data`: any): *Promise‹any›*

*Implementation of [ISupervisedEmitter](../interfaces/isupervisedemitter.md)*

Publishes the given event to all the matching
subscribers.

NOTE: This is an asynchronous call, so if you want to
publish events one after the other, then you will have
to `await` on each publish call.
Please see the example below for more details.

**Example**

Simple publish (fire and forget):
```JS
SE.publish('foo/bar', 1);

SE.publish('foo/bar', 'hello world');
```

Publish one after the other (execute all the subscription pipelines before moving to next publish):
```JS
await SE.publish('publish/first', 'first');

// This will be published only after all the
// matching subscription pipelines of the above
// publish events have been completed
await SE.publish('publish/second', 'second');
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`pubEvent` | string | Event to publish the given data |
`data` | any | Any data that need to be published  |

**Returns:** *Promise‹any›*

Awaitable publish

___

###  subscribe

▸ **subscribe**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *[ISubscription](../interfaces/isubscription.md)*

*Implementation of [ISupervisedEmitter](../interfaces/isupervisedemitter.md)*

Subscribes to a given event and pipes all the
handlers passed for this event.

Please note that each handler must pass on the
data that must be handled by the next handler, as
all these handlers will be piped (compose in reverse direction).

Chaining subscriptions is also possible. Please see the
example below for more details.

For more info on `pipe` visit:
https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937

**Example**

```JS
const subscription = SE.subscribe('foo/bar',
  ({data}) => {
    console.log(data); //=> 1
    return data + 1,
  },
  ({data}) => {
    console.log(data); //=> 2
  }
).subscribe('foo/*',
  ({data}) => console.log(data) //=> 1
);

await SE.publish('/foo/bar', 1);

subscription.unsubscribe();
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`event` | string | Subscription event |
`...handlers` | [IHandler](../README.md#ihandler)[] | List of handlers  |

**Returns:** *[ISubscription](../interfaces/isubscription.md)*

Subscription for chaining more subscriptions or
   for unsubscribing from all the subscriptions

___

###  subscribeOnce

▸ **subscribeOnce**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *[ISubscription](../interfaces/isubscription.md)*

*Implementation of [ISupervisedEmitter](../interfaces/isupervisedemitter.md)*

Similar to [subscribe](supervisedemitter.md#subscribe), but it listens only to
the first event and unsubscribes itself thereafter.

**Example**

```JS
let calls = 0;
const subscription = SE.subscribeOnce('foo/bar', () => calls++)

await SE.publish('/foo/bar', 'test');
await SE.publish('/foo/bar', 'test');

console.log(calls) //=> 1

subscription.unsubscribe();
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`event` | string | Subscription event |
`...handlers` | [IHandler](../README.md#ihandler)[] | List of handlers  |

**Returns:** *[ISubscription](../interfaces/isubscription.md)*

Subscription for chaining more subscriptions or
   for unsubscribing from all the subscriptions

___

###  unScope

▸ **unScope**(`event`: string): *string*

*Implementation of [ISupervisedEmitter](../interfaces/isupervisedemitter.md)*

Strips out the scope part in the given
scoped event.

i.e, it converts __scope_<number>_/foo/bar => foo/bar

This method can be used in your middlewares
to unshell the scope part in the topic and run
your logics.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`event` | string | Scoped event  |

**Returns:** *string*

Event without scope part
