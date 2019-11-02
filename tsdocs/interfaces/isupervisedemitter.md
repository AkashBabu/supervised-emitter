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
* [unScope](isupervisedemitter.md#unscope)

## Methods

###  getScope

▸ **getScope**(): *[IGetScope](../README.md#igetscope)*

**Returns:** *[IGetScope](../README.md#igetscope)*

___

###  publish

▸ **publish**(`pubEvent`: string, `data`: any): *Promise‹any›*

**Parameters:**

Name | Type |
------ | ------ |
`pubEvent` | string |
`data` | any |

**Returns:** *Promise‹any›*

___

###  subscribe

▸ **subscribe**(`event`: string, ...`handlers`: [IHandler](../README.md#ihandler)[]): *[ISubscription](isubscription.md)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`...handlers` | [IHandler](../README.md#ihandler)[] |

**Returns:** *[ISubscription](isubscription.md)*

___

###  unScope

▸ **unScope**(`event`: string): *string*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *string*
