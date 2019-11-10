# supervisedemitter

[Supervised-Emitter](../) › [SupervisedEmitter](supervisedemitter.md)

## Class: SupervisedEmitter

SupervisedEmitter is an event emitter library which supports middlewares, event-tracing, glob subscriptions etc

It's main applications can be found in State management \(React, Vue etc\)

### Hierarchy

* **SupervisedEmitter**

### Implements

* [ISupervisedEmitter](../interfaces/isupervisedemitter.md)

### Index

#### Constructors

* [constructor](supervisedemitter.md#constructor)

#### Methods

* [getScope](supervisedemitter.md#getscope)
* [publish](supervisedemitter.md#publish)
* [subscribe](supervisedemitter.md#subscribe)
* [subscribeOnce](supervisedemitter.md#subscribeonce)
* [unScope](supervisedemitter.md#unscope)

### Constructors

#### constructor

+ **new SupervisedEmitter**\(`middlewares?`: [IMiddleware](../#imiddleware)\[\], `options?`: [IOptions](../interfaces/ioptions.md)\): [_SupervisedEmitter_](supervisedemitter.md)

Creates a new instance of SupervisedEmitter

**Example**

Initializing with no middlewares:

```javascript
import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter();
```

Initializing with middlewares and options:

```javascript
const SE = new SupervisedEmitter(
  [eventTraceMiddleware],
  {debug: true, lfu: {max: 50}}
);
```

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `middlewares?` | [IMiddleware](../#imiddleware)\[\] | List of middlewares. Remember that all these     middlewares will be piped to form a pipeline. i.e. the output of     each of the middleware is passed in `data`\(in the context\) to the next     middleware in the pipeline \(top-down execution\) |
| `options?` | [IOptions](../interfaces/ioptions.md) | Options for debugging and LFU |

**Returns:** [_SupervisedEmitter_](supervisedemitter.md)

### Methods

#### getScope

▸ **getScope**\(\): [_IGetScope_](../#igetscope)

_Implementation of_ [_ISupervisedEmitter_](../interfaces/isupervisedemitter.md)

Adds scope to a event by prefixing it with a incrementing counter string\(_\_scope_\_/\), such that everytime this is called the subscribers can listen only on scoped events. This is especially useful when you don't want other subscribers to listen to this event. Then this behaves more like a camouflage event, which is visible only to scoped subscribers.

This is especially useful when multiple instances of the same class is listening and is interested only in events of its own instance.

**Example**

In React, if you're using the same component in multiple places but your actions\(Show popup, make a request etc\) are different in each place, then you may achieve it like this:

```jsx
/// container.jsx
const [{scope}] = useState({scope: SE.getScope()});

SE.subscribe(scope('asdf/asdf/asdf'), ({data}) => {
  // ...
});

<ChildComponent scope={scope} />

/// In ChildComponent.jsx
SE.publish(this.props.scope('asdf/asdf/asdf'),  data)
```

**Returns:** [_IGetScope_](../#igetscope)

Function\(Closure\) that can add scope to events

#### publish

▸ **publish**\(`pubEvent`: string, `data`: any\): _Promise‹any›_

_Implementation of_ [_ISupervisedEmitter_](../interfaces/isupervisedemitter.md)

Publishes the given event to all the matching subscribers.

NOTE: This is an asynchronous call, so if you want to publish events one after the other, then you will have to `await` on each publish call. Please see the example below for more details.

**Example**

Simple publish \(fire and forget\):

```javascript
SE.publish('foo/bar', 1);

SE.publish('foo/bar', 'hello world');
```

Publish one after the other \(execute all the subscription pipelines before moving to next publish\):

```javascript
await SE.publish('publish/first', 'first');

// This will be published only after all the
// matching subscription pipelines of the above
// publish events have been completed
await SE.publish('publish/second', 'second');
```

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `pubEvent` | string | Event to publish the given data |
| `data` | any | Any data that need to be published |

**Returns:** _Promise‹any›_

Awaitable publish

#### subscribe

▸ **subscribe**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](../interfaces/isubscription.md)

_Implementation of_ [_ISupervisedEmitter_](../interfaces/isupervisedemitter.md)

Subscribes to a given event and pipes all the handlers passed for this event.

Please note that each handler must pass on the data that must be handled by the next handler, as all these handlers will be piped \(compose in reverse direction\).

Chaining subscriptions is also possible. Please see the example below for more details.

For more info on `pipe` visit: [https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937](https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937)

**Example**

```javascript
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

| Name | Type | Description |
| :--- | :--- | :--- |
| `event` | string | Subscription event |
| `...handlers` | [IHandler](../#ihandler)\[\] | List of handlers |

**Returns:** [_ISubscription_](../interfaces/isubscription.md)

Subscription for chaining more subscriptions or for unsubscribing from all the subscriptions

#### subscribeOnce

▸ **subscribeOnce**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](../interfaces/isubscription.md)

_Implementation of_ [_ISupervisedEmitter_](../interfaces/isupervisedemitter.md)

Similar to [subscribe](supervisedemitter.md#subscribe), but it listens only to the first event and unsubscribes itself thereafter.

**Example**

```javascript
let calls = 0;
const subscription = SE.subscribeOnce('foo/bar', () => calls++)

await SE.publish('/foo/bar', 'test');
await SE.publish('/foo/bar', 'test');

console.log(calls) //=> 1

subscription.unsubscribe();
```

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `event` | string | Subscription event |
| `...handlers` | [IHandler](../#ihandler)\[\] | List of handlers |

**Returns:** [_ISubscription_](../interfaces/isubscription.md)

Subscription for chaining more subscriptions or for unsubscribing from all the subscriptions

#### unScope

▸ **unScope**\(`event`: string\): _string_

_Implementation of_ [_ISupervisedEmitter_](../interfaces/isupervisedemitter.md)

Strips out the scope part in the given scoped event.

i.e, it converts _\_scope_\_/foo/bar =&gt; foo/bar

This method can be used in your middlewares to unshell the scope part in the topic and run your logics.

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `event` | string | Scoped event |

**Returns:** _string_

Event without scope part

