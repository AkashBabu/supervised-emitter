# API Docs

[Supervised-Emitter](./)

## Supervised-Emitter

### Index

#### Classes

* [SupervisedEmitter](classes/supervisedemitter.md)

#### Interfaces

* [IContext](interfaces/icontext.md)
* [IOptions](interfaces/ioptions.md)
* [ISubscription](interfaces/isubscription.md)
* [ISupervisedEmitter](interfaces/isupervisedemitter.md)

#### Type aliases

* [IEnd](./#iend)
* [IGetScope](./#igetscope)
* [IHandler](./#ihandler)
* [IMiddleware](./#imiddleware)

### Type aliases

#### IEnd

Ƭ **IEnd**: _function_

Function signature of `end` property in [IContext](interfaces/icontext.md)

**Type declaration:**

▸ \(`data`: any\): _any_

**Parameters:**

| Name | Type |
| :--- | :--- |
| `data` | any |

#### IGetScope

Ƭ **IGetScope**: _function_

Closure function that can add scope to the provide event

**`param`** Event

**Type declaration:**

▸ \(`event`: string\): _string_

**Parameters:**

| Name | Type |
| :--- | :--- |
| `event` | string |

#### IHandler

Ƭ **IHandler**: _function_

**Type declaration:**

▸ \(`ctx`: [IContext](interfaces/icontext.md), ...`args`: any\[\]\): _any_

**Parameters:**

| Name | Type |
| :--- | :--- |
| `ctx` | [IContext](interfaces/icontext.md) |
| `...args` | any\[\] |

#### IMiddleware

Ƭ **IMiddleware**: _function_

Function signature of middlewares

**Type declaration:**

▸ \(`ctx`: [IContext](interfaces/icontext.md)\): _void_

**Parameters:**

| Name | Type |
| :--- | :--- |
| `ctx` | [IContext](interfaces/icontext.md) |

