[Supervised-Emitter](README.md)

# Supervised-Emitter

## Index

### Classes

* [SupervisedEmitter](classes/supervisedemitter.md)

### Interfaces

* [IContext](interfaces/icontext.md)
* [IInternalEvents](interfaces/iinternalevents.md)
* [IOptions](interfaces/ioptions.md)
* [ISubPipeline](interfaces/isubpipeline.md)
* [ISubscription](interfaces/isubscription.md)
* [ISupervisedEmitter](interfaces/isupervisedemitter.md)

### Type aliases

* [IGetScope](README.md#igetscope)
* [IHandler](README.md#ihandler)
* [IMiddleware](README.md#imiddleware)

### Functions

* [getMapKeys](README.md#getmapkeys)
* [internalEvent](README.md#const-internalevent)
* [mergeOptions](README.md#mergeoptions)
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

▸ (`ctx`: [IContext](interfaces/icontext.md), ...`args`: any[]): *any | Promise‹any›*

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

###  getMapKeys

▸ **getMapKeys**(`map`: Map‹string, boolean›): *string[]*

Returns all the keys in the Map

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`map` | Map‹string, boolean› | Map  |

**Returns:** *string[]*

List of keys in the given map

___

### `Const` internalEvent

▸ **internalEvent**(`ev`: string): *string*

Suffixes internal event part
to the given event

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`ev` | string | Event  |

**Returns:** *string*

___

###  mergeOptions

▸ **mergeOptions**(`givenOpts`: any, `defaultOpts`: any): *any*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`givenOpts` | any |  {} |
`defaultOpts` | any |  {} |

**Returns:** *any*

___

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
