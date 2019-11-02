[Supervised-Emitter](../README.md) › [ISubscription](isubscription.md)

# Interface: ISubscription

`.subscribe()` method's interface.
It's interesting to note that this indicates
a possibility of chaining multiple subscriptions.

## Hierarchy

* **ISubscription**

## Index

### Methods

* [subscribe](isubscription.md#subscribe)
* [unsubscribe](isubscription.md#unsubscribe)

## Methods

###  subscribe

▸ **subscribe**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *[ISubscription](isubscription.md)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`...handlers` | [IHandler](../README.md#ihandler)[] |

**Returns:** *[ISubscription](isubscription.md)*

___

###  unsubscribe

▸ **unsubscribe**(): *void*

**Returns:** *void*
