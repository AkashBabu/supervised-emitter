# icontext

[Supervised-Emitter](../) › [IContext](icontext.md)

## Interface: IContext

Context object that will be passed as the seconds argument to subscribers and first argument to middlewares

### Hierarchy

* **IContext**

### Indexable

* \[ **newProp**: _string_\]: any

Any other properties that the middleware desires to add to context

### Index

#### Properties

* [data](icontext.md#data)
* [end](icontext.md#optional-end)
* [pubEvent](icontext.md#pubevent)
* [subEvents](icontext.md#subevents)

### Properties

#### data

• **data**: _any_

Published data

#### `Optional` end

• **end**? : [_IEnd_](../#iend)

Function to stop the pipeline

#### pubEvent

• **pubEvent**: _string_

Published event

#### subEvents

• **subEvents**: _string\[\]_

Matching subscribed events

