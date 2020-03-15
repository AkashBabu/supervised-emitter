[Supervised-Emitter](../README.md) › [ISubscription](isubscription.md)

# Interface: ISubscription

`.subscribe()` method's interface. Since this interface
return [ISubscription](isubscription.md) on subscribe|subscribeOnce, you may
chain as many subscriptions as needed and all the chained
subscription can be unsubscribed by running unsubscription
just once on the final subscription returned.

**Example**
```TS
const subscription = SE.subscribe('foo/bar', () => {})
                       .subscribe('hello/world', () => {});

subscription.unsubscribe();
```

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
