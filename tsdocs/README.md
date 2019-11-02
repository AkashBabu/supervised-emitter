[Supervised-Emitter](README.md)

# Supervised-Emitter

## Index

### Classes

* [SupervisedEmitter](classes/supervisedemitter.md)

### Interfaces

* [IContext](interfaces/icontext.md)
* [IOptions](interfaces/ioptions.md)
* [ISubscription](interfaces/isubscription.md)
* [ISupervisedEmitter](interfaces/isupervisedemitter.md)

### Type aliases

* [IEnd](README.md#iend)
* [IGetScope](README.md#igetscope)
* [IHandler](README.md#ihandler)
* [IMiddleware](README.md#imiddleware)

## Type aliases

###  IEnd

Ƭ **IEnd**: *function*

Function signature of `end` property in [IContext](interfaces/icontext.md)

#### Type declaration:

▸ (`data`: any): *any*

**Parameters:**

Name | Type |
------ | ------ |
`data` | any |

___

###  IGetScope

Ƭ **IGetScope**: *function*

Closure function that can add scope
to the provide event

**`param`** Event

#### Type declaration:

▸ (`event`: string): *string*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

___

###  IHandler

Ƭ **IHandler**: *function*

#### Type declaration:

▸ (`ctx`: [IContext](interfaces/icontext.md), ...`args`: any[]): *any*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | [IContext](interfaces/icontext.md) |
`...args` | any[] |

___

###  IMiddleware

Ƭ **IMiddleware**: *function*

Function signature of middlewares

#### Type declaration:

▸ (`ctx`: [IContext](interfaces/icontext.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | [IContext](interfaces/icontext.md) |
