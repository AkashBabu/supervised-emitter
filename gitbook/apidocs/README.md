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

* [IGetScope](README.md#igetscope)
* [IHandler](README.md#ihandler)
* [IMiddleware](README.md#imiddleware)

### Functions

* [patternHandler](README.md#patternhandler)

## Type aliases

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

▸ (`ctx`: [IContext](interfaces/icontext.md)): *Promise‹any› | any*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | [IContext](interfaces/icontext.md) |

## Functions

###  patternHandler

▸ **patternHandler**(`pattern`: string, `middleware`: [IMiddleware](README.md#imiddleware)): *[IMiddleware](README.md#imiddleware)*

Creates a middleware which will be run
only when the pubEvent matches the given
pattern

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`pattern` | string | Subscription event |
`middleware` | [IMiddleware](README.md#imiddleware) | Middleware subscribed on the pattern  |

**Returns:** *[IMiddleware](README.md#imiddleware)*
