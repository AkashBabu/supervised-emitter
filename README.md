# template-lib
A NodeJS event emitter library that supports middleware functionality which can be used to supervise the events flow in the system / application.

## Installation
> npm i supervised-emitter -S

## Getting started
This library is no different from the native `event-emitter` library, but for the following features:
* Glob pattern pub/sub
* Middlewares
* Easy to use apis
* Composibility
* Chainable APIs

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

We see a huge pitfall when the number of events and the handlers grow. So for us to optimize the publishing mechanism for handling Glob pattern subscribers, we may have to compile the events being used in the system and hence will have to know them before being used in the system. So please bear with the idea of declaring the events upfront.

SingleTon, hence the library can be imported throughout your application without the need to handle singleton

Trust me!! This is a very small library, so please go through the source code for detailed information on internal working (even though explained below)😜

It's in the design of this library that this library's potential SHOULD NEVER become a bottleneck to the scale of your application.
It's small for Small apps and grows with the scale of the application.
Be it small or large application, we serve 'em all

Highly efficient library, with possibly no bottlenecks irrespective of the number of subscriptions and unsubscriptions and compositions.
We use DLLs for maintaining a record of subscriptions and hence `NO splicing`. Also the complexity for unsubscription now becomes O(1).
We return a closure function `unsubscribe` during subscription and the same can be used to unsubscribe and hence `NO need to pass the functions for unsubscription even if being composed`.

Suggest you to put all the necessary information only in the data argument and DO NOT include variable data in event/topic (for better efficiency) because for every new topic all the subscribed events are chaecked for a match else the cached result is used.

Highlight the word TOPIC instead of Events

use new ctx for every pipeline because one pipeline must never affect the other except middleware pipeline, else it gets difficult to debug.
If you want to use the same set of handlers in multiple places then compose such handlers and use the same in events handlers (TODO: example for the same)

## Publishing scoped events 
* by generating random string and prefixing it to the event name
  * caveat is that, how do we pass the randomly created topic name down the stream

## Chaining Subscriptions / Unsubscriptions


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

## Benchmark
Benchmarks have been performed against the native EventEmitter library and has proven to be faster than the native library. Please check it by yourself by cloning and running the benchmarks.

## Contributions
Issues, PRs and feature-requests, All are welcome!!!

## Pattern matching algorithm

asdf/* -> asdf/hjkl/ | asdf/qweroiu | asdf/iu1234uiqwer
asdf/** -> adsf/asdf/asdf/ | asdf/qwer | adsf/

#### Caveats
*** or ***.. is considered as a normal string and not as a pattern!!
Order of subscription is not the order of execution for pattern subscribers
CANNOT use patterns for publishing. If used then, it'll be treated as normal strings

## Custom middlewares

```JS
export default function EventTrace({traceLength = 10} = {}) {
  return (_, event) => {
    if(!ctx.eventTrace) = ctx.eventTrace = []

    ctx.eventTrace.push(event)
    if(ctx.eventTrace.length > traceLength) ctx.eventTrace.shift();

    ctx.printEventTrace = () => {
      for(let i = (ctx.eventTrace || []).length - 1; i > -1; i++)
        console.log(` -> ${ctx.eventTrace[i]}`)
    }
  }
}
```

## Internal Working Document
Keyword:
`pubTopic` : Published Topic
`subTopic` : Subscription Topic

## TODOs
- [ ] Documentation
- [ ] Themed method names
- [ ] Debugging messages with log level
- [ ] Usage of DLLs
- [ ] Benchmarks
- [ ] Internal functioning documentation

- [ ] LFU for caching the matching events
- [ ] Middlewares
- [ ] Subscription must also take care updating the cache
- [ ] Unsubscription must also take care updating the cache
- [ ] Events and handlers trace

## Challenges
- [ ] Timeout between every middleware called (such that the main thread is never blocked because of a huge list of event handlers)
- [ ] Use of indices of events for caching rather than the string (for space optimization)
- [ ] LFU Cache
- [ ] DLL for managing event handlers list
- [ ] 





- [ ] Update template with eslintignore and other changes made in this project
- [ ] update test cases


## Features
- [ ] Middlewares
- [ ] Composing handlers
- [ ] Glob pattern subscriptions