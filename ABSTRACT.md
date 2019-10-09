# Supervised-Emitter
A NodeJS event emitter library that supports middleware functionality which can be used to supervise the events flow in the system / application.


#### Example
Usage in NodeJS
```JS

```

Usage in ReactJS:
Say NO to injection of reducers, sagas etc.
Say NO to a looootttsss of plugins like redux-sagas, thunk, reselect etc.
Say NO to running unnecessary reducers everytime.
Say 
```JS

```


Trust me!! This is a very small library, so please go through the source code for detailed information on internal working (even though explained below)😜

Highly efficient library, with possibly no bottlenecks irrespective of the number of subscriptions and unsubscriptions and compositions.
We use DLLs for maintaining a record of subscriptions and hence `NO splicing`. Also the complexity for unsubscription now becomes O(1).
We return a closure function `unsubscribe` during subscription and the same can be used to unsubscribe and hence `NO need to pass the functions for unsubscription even if being composed`.

Suggest you to put all the necessary information only in the data argument and DO NOT include variable data in event/topic (for better efficiency) because for every new topic all the subscribed events are chaecked for a match else the cached result is used.

use new ctx for every pipeline because one pipeline must never affect the other except middleware pipeline, else it gets difficult to debug.
If you want to use the same set of handlers in multiple places then compose such handlers and use the same in events handlers (TODO: example for the same)

Addition / Removal of a hanlder doesn't trigger a rebuild of the entire handler chain (unlike redux, where all the reducers are recomposed everytime a reducers is injected / removed)

## State maintaining middleware
.subscribe("state/**")

## Publishing scoped events 
* by generating random string and prefixing it to the event name
  * caveat is that, how do we pass the randomly created topic name down the stream

## Dynamic state maintenance
State resurrection is done by publishing all the last occured events with the last data, such that the application state is revived

## Design challenges
* How to make event handler match performant? 
  * Cache the matched result
  * Which cache to use ? LRU ? LFU ?
    * Choose to use LFU based on heuristics that same events once used will be used more frequently (For instance onChange of input field, form Submit (retry) etc)
* how to maintain scope of an event 
* Chaining subscriptions / unsubscriptions
* how to trace events
* how to maintain state

## Contributions
Issues, PRs and feature-requests, All are welcome!!!

## Pattern matching algorithm

asdf/* -> asdf/hjkl/ | asdf/qweroiu | asdf/iu1234uiqwer
asdf/** -> adsf/asdf/asdf/ | asdf/qwer | adsf/

#### Caveats
*** or ***.. is considered as a normal string and not as a pattern!!
Order of subscription is not the order of execution for pattern subscribers
CANNOT use patterns for publishing. If used then, it'll be treated as normal strings

## Debug messages activation



## Challenges



## Features
- [ ] Middlewares
- [ ] Composing handlers
- [ ] Glob pattern subscriptions
- [ ] Well Tested
- [ ] Simple library and hence fewer bugs. NO Plugins bullshit! So no beating around the bush. Its just the library, so use it with ease. Least boilerplate needed.

- [ ] State Management is in your hands. So use it only when needed