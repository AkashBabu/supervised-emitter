[Supervised-Emitter](../README.md) › [IInternalEvents](iinternalevents.md)

# Interface: IInternalEvents

Interface for internal-events

## Hierarchy

* **IInternalEvents**

## Index

### Properties

* [ON_ERROR](iinternalevents.md#on_error)
* [ON_INIT](iinternalevents.md#on_init)
* [ON_SUBSCRIBE](iinternalevents.md#on_subscribe)
* [ON_UNSUBSCRIBE](iinternalevents.md#on_unsubscribe)

## Properties

###  ON_ERROR

• **ON_ERROR**: *string*

This event will be published everytime an
error occurs during publish cycle. Users shall
subscribe to this topic to understand the error
and push the same to error tracking systems like
Sentry, Fabric or the like.

___

###  ON_INIT

• **ON_INIT**: *string*

This event is published when Supervised-Emitter
instance is created and setup is done

___

###  ON_SUBSCRIBE

• **ON_SUBSCRIBE**: *string*

This event will be published everytime a new
subscription is made

___

###  ON_UNSUBSCRIBE

• **ON_UNSUBSCRIBE**: *string*

This event will be published everytime an
unsubscription an any topic is mode
