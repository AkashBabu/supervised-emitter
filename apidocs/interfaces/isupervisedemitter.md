# isupervisedemitter

[Supervised-Emitter](../) › [ISupervisedEmitter](isupervisedemitter.md)

## Interface: ISupervisedEmitter

SupervisedEmitter's interface

### Hierarchy

* **ISupervisedEmitter**

### Implemented by

* [SupervisedEmitter](../classes/supervisedemitter.md)

### Index

#### Methods

* [getScope](isupervisedemitter.md#getscope)
* [publish](isupervisedemitter.md#publish)
* [subscribe](isupervisedemitter.md#subscribe)
* [subscribeOnce](isupervisedemitter.md#subscribeonce)
* [unScope](isupervisedemitter.md#unscope)

### Methods

#### getScope

▸ **getScope**\(\): [_IGetScope_](../#igetscope)

Returns a Closure function that adds scope to an event

**Returns:** [_IGetScope_](../#igetscope)

#### publish

▸ **publish**\(`pubEvent`: string, `data`: any\): _Promise‹any›_

Publishes data on the given pubEvent

**Parameters:**

| Name | Type |
| :--- | :--- |
| `pubEvent` | string |
| `data` | any |

**Returns:** _Promise‹any›_

#### subscribe

▸ **subscribe**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](isubscription.md)

Subscribes to an event

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |
| `...handlers` | [IHandler](../#ihandler)\[\] |

**Returns:** [_ISubscription_](isubscription.md)

#### subscribeOnce

▸ **subscribeOnce**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](isubscription.md)

Subscribes to an event only once

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |
| `...handlers` | [IHandler](../#ihandler)\[\] |

**Returns:** [_ISubscription_](isubscription.md)

#### unScope

▸ **unScope**\(`event`: string\): _string_

This strip the scope part in the given event

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |

**Returns:** _string_

