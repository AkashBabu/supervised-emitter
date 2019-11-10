# isubscription

[Supervised-Emitter](../) › [ISubscription](isubscription.md)

## Interface: ISubscription

`.subscribe()` method's interface. It's interesting to note that this indicates a possibility of chaining multiple subscriptions.

### Hierarchy

* **ISubscription**

### Index

#### Methods

* [subscribe](isubscription.md#subscribe)
* [subscribeOnce](isubscription.md#subscribeonce)
* [unsubscribe](isubscription.md#unsubscribe)

### Methods

#### subscribe

▸ **subscribe**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](isubscription.md)

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |
| `...handlers` | [IHandler](../#ihandler)\[\] |

**Returns:** [_ISubscription_](isubscription.md)

#### subscribeOnce

▸ **subscribeOnce**\(`event`: string, ...`handlers`: [IHandler](../#ihandler)\[\]\): [_ISubscription_](isubscription.md)

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |
| `...handlers` | [IHandler](../#ihandler)\[\] |

**Returns:** [_ISubscription_](isubscription.md)

#### unsubscribe

▸ **unsubscribe**\(\): _void_

**Returns:** _void_

