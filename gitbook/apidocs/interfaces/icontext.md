[Supervised-Emitter](../README.md) › [IContext](icontext.md)

# Interface: IContext

Context object that will be passed as the second argument
to subscribers and first argument to middlewares

## Hierarchy

* **IContext**

## Indexable

* \[ **newProp**: *string*\]: any

Any other properties that the middleware/subscription
pipeline desires to add to the context. This technique
can be used to create methods like printEventTrace, onEnd etc

## Index

### Properties

* [data](icontext.md#data)
* [pipelinePromise](icontext.md#optional-pipelinepromise)
* [pubEvent](icontext.md#pubevent)
* [subEvents](icontext.md#subevents)

## Properties

###  data

• **data**: *any*

Data that was published.
Since data is piped through the middleware
pipeline and then through all subscription
pipeline, this might NOT be the same as
published.

___

### `Optional` pipelinePromise

• **pipelinePromise**? : *Promise‹any›*

This promise will be resolved when the pipeline
has completed execution. This can be very useful
in situations wherein the user wants to execute some action
when this pipeline has been completed, irrespective of
whether it is stopped in between or has completed the pipeline.
In fact, same technique was used to create subscribeOnce
feature as well.

Note: User MUST NOT await on this promise, instead `then`
must be used because if awaited, it would wait for Infinite time
as it results in a circular dependent promise.

___

###  pubEvent

• **pubEvent**: *string*

Published event.
This information can be used in middlewares to
maintain a stack of event that were published in
the system and the same can be used to reproduce
a bug.

___

###  subEvents

• **subEvents**: *string[]*

All subEvents that match the pubEvent.
Note that even if multiple pipelines are hooked
to the same subEvent, this Array would include it
only once. So NO duplicate event will be found in
subEvents.
