[Supervised-Emitter](../README.md) › [ISupervisedEmitter](isupervisedemitter.md)

# Interface: ISupervisedEmitter

SupervisedEmitter's interface

## Hierarchy

* **ISupervisedEmitter**

## Implemented by

* [SupervisedEmitter](../classes/supervisedemitter.md)

## Index

### Methods

* [getScope](isupervisedemitter.md#getscope)
* [publish](isupervisedemitter.md#publish)
* [subscribe](isupervisedemitter.md#subscribe)
* [subscribeOnce](isupervisedemitter.md#subscribeonce)
* [unScope](isupervisedemitter.md#unscope)
* [waitTill](isupervisedemitter.md#waittill)

## Methods

###  getScope

▸ **getScope**(): *[IGetScope](../README.md#igetscope)*

Returns a Closure function that adds scope to an event

**Returns:** *[IGetScope](../README.md#igetscope)*

___

###  publish

▸ **publish**(`pubEvent`: string, `data`: any): *Promise‹any›*

Publishes data on the given pubEvent

**Parameters:**

Name | Type |
------ | ------ |
`pubEvent` | string |
`data` | any |

**Returns:** *Promise‹any›*

___

###  subscribe

▸ **subscribe**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *[ISubscription](isubscription.md)*

Subscribes to an event

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`...handlers` | [IHandler](../README.md#ihandler)[] |

**Returns:** *[ISubscription](isubscription.md)*

___

###  subscribeOnce

▸ **subscribeOnce**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *Promise‹any›*

Subscribes to an event only once

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`...handlers` | [IHandler](../README.md#ihandler)[] |

**Returns:** *Promise‹any›*

___

###  unScope

▸ **unScope**(`event`: string): *string*

This strips the scope part in the given event

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *string*

___

###  waitTill

▸ **waitTill**(`event`: string): *Promise‹any›*

Waits untill the required event is fired

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *Promise‹any›*
