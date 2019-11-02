[Supervised-Emitter](../README.md) › [IContext](icontext.md)

# Interface: IContext

Context object that will be passed as the seconds argument
to subscribers and first argument to middlewares

## Hierarchy

* **IContext**

## Indexable

* \[ **newProp**: *string*\]: any

Any other properties that the middleware desires
to add to context

## Index

### Properties

* [data](icontext.md#data)
* [end](icontext.md#optional-end)
* [pubEvent](icontext.md#pubevent)
* [subEvents](icontext.md#subevents)

## Properties

###  data

• **data**: *any*

Published data

___

### `Optional` end

• **end**? : *[IEnd](../README.md#iend)*

Function to stop the pipeline

___

###  pubEvent

• **pubEvent**: *string*

Published event

___

###  subEvents

• **subEvents**: *string[]*

Matching subscribed events
