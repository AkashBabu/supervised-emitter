# Supervised-Emitter (SE) [![Coverage Status](https://coveralls.io/repos/github/AkashBabu/supervised-emitter/badge.svg?branch=master)](https://coveralls.io/github/AkashBabu/supervised-emitter?branch=master) [![Build Status](https://travis-ci.com/AkashBabu/supervised-emitter.svg?branch=master)](https://travis-ci.com/AkashBabu/supervised-emitter) [![Maintainability](https://api.codeclimate.com/v1/badges/c9b43dc6dabc74c8861f/maintainability)](https://codeclimate.com/github/AkashBabu/supervised-emitter/maintainability)
LICENSE and PR WELCOME

## Table of contents
* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#usage-in-reactjs)
* [Feature list](#feature-list)
  * [Why we chose wildcard subscription ?](#why-we-chose-wildcard-subscription)
* [Performance](#performance)
* [Architecture](#architecture)
* [Algorithm](#algorithm)
* [API Documentation](#api-documentation)
* [Create custom middlewares](#create-custom-middlewares)
* [Caveats](#caveats)
* [Pattern matches](#pattern-matches)
* [Major differences between this library and redux](#for-those-who-are-keen-on-knowing-the-major-differences-between-this-library-and-redux)
* [Why don't we just use the native event emitter library ?](#why-dont-we-just-use-the-native-event-emitter-library)
* [For the curious ones](#for-the-curious-ones)
* [FAQs](#faqs)

## Introduction
Another pub-sub library!!! Hey hold on... there's a lot more features like middleware capability, chaining subscriptions, pattern subscription and more.

If this library is used in React for communication between containers/components, then it'll reduce a lots of boilerplate needed and also would make the usage / adoption very easy.



## Installation
> npm i supervised-emitter --save



## Usage in ReactJS
```JSX
/// componentA.jsx
import SE from 'supervised-emitter';
import React from 'react'

export default function ComponentA() {
  function handleClick() {
    SE.publish('btn/clicked', 'some-data');
  }

  return <button onClick={handleClick}>Click me!</button>
}


/// componentB.jsx
import SE from 'supervised-emitter';
import React, {useEffect, useState} from 'react'

export default function ComponentB() {
  const [text, setText] = useState('Listening...');

  useEffect(() => {
    const subscription = SE.subscribe('btn/clicked', ({data}) => setText('btn clicked!'))

    return () => subscription.unsubscribe();
  }, [])

  return <span>{text}</span>
}


/// App.jsx
import React from 'react'
import ComponentA from './componentA'
import ComponentB from './componentB'

export default function App() {
  return <div>
    <ComponentA />
    <ComponentB />
  </div>
}
```
For a sample ReactJS application visit.



## Feature list:
- Written in typescript for robust APIs
- Support for middlewares
  - Now you can listen to all the published events and modify the content or even stop the flow of data in the pipeline.
- Composibility
  - There need not be just one handler, but multiple handlers where the output of one is piped into the next handler. For ex:
    ```JS
    SE.subscribe('/hello/world', 
      ({data}) => data + 1, 
      ({data}) => console.log(data); //=> 2
    );

    SE.publish('/hello/world', 1)
    ```
- Support for wildcard subscriptions
  - No more plain event subscriptions, which means you can listen to a bunch of events with a simple wildcard pattern. For ex:
    ```JS
    SE.subscribe('/hello/*', () => {})
    SE.subscribe('hello/**', () => {})
    ```
  - '*' would match one unmatched part. 
    - For ex: `/cat/*/bat`   
    Match SUCCESS `/cat/rat/bat`, `/cat/mat/bat`, `/cat/asdf/bat`  
    Match FAIL    `/cat/rat/rat`, `/cat/asdf/sdf/asdf`, `/cat/bat`
  - '**' would match more than one unmatched part. 
    - For ex: `/cat/**/bat`  
    Match SUCCESS `/cat/rat/bat`, `/cat/rat/mat/bat`, `/cat/bat`  
    Match FAIL    `/cat/rat/rat`
- Chaining subscriptions
  - You can chain a list of subscriptions and unsubscribe at once instead of subscribing / unsubscribing for each event. Please read [API Documentation](#api-documentation) for more details.
    ```JS
    const subscription = SE.subscribe('/foo/bar', () => {})
    .subscribe('/lion/rat', () => {})
    .subscribe('btn/*', () => {})

    subscription.unsubscribe();
    ```
- Most importantly, you don't have to specify the event-name and the handler function during unsubscription 😜, instead it's as easy as `subscription.unsubscribe()`
- Supports async handlers
  - Every handler in the pipeline is `await`ed
- You can await on Publish action
- Can stop the flow of data in between a pipeline
- It's a singleton at its core, so you don't have to worry about managing your own singleton or passing the instance all around in your application.
- Can publish scoped events!!!
  - This mean you can have multiple instances of the same component, but can still operate in isolation.
- Don't have to worry about multiple slashes, leading slash(/) & trailing slash(/)
  - Every event is sanitized before being used in the system. Hence `/hello/world`, `hello/world/` & `///hello//world/` would all MEAN THE SAME
- Use it everywhere, irrespective of whether you use React / Vue / Angular / Vanilla JS
- Controlled rate of publishes at a time
  - This ensures that we don't run out of Memory causing page crashes.
- TCO subscription chain
- TCO pipelines

#### Why we chose wildcard subscription ?
Primarily there are two types of event subscriptions: Normal event subscriptions & Wildcard event subscriptions.  
Normal event subscriptions are very easy to match with the pubEvent, as it is a direct string comparison and we could use hashmap for the purpose.  
Where as Wildcard event subscriptions needs some pattern matching algorithm.
Straight forward solution to the pattern matching algorithm would be `RegExp`, since it is completely customizable, but it is slow :(
So we chose to go with wildcards. It is not completely customizable, but covers most of the cases. Now the comparison has to be made against each part of the event, which is much faster than RegExp matching.



## Before reading on
Please get yourself familiar with these terminologies before reading on...
- *pubEvent* : Published Event
- *subEvent* : Subscribed Event
- *matching Events* : All the matching subscribed pattern events for the published event
- *LFU cache* : Least Frequently used cache
- *DLL* : Doubly linked list
- *event part* : It's a part of the event topic. For ex: If the event is `hello/world`, then `hello, world` are event parts. Since this library supports wildcards, you must follow a particular format for naming your event to take advantage of the wildcard feature. So instead of using `_`, `-` or the like, please use `/` as logical seperator in your events. For ex: `/foo/bar/baz`
- *pipeline* : Function composition in the reverse direction. Please read [this](https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937) for more information on pipe
- *subscription pipelines* : All pipelines hooked to the subEvent that matches the pubEvent. Please note that, even if the handlers are hooked to the same subEvent (with exact string albeit w/ or w/o wildcards) are treated as different pipelines and hence will have individual contexts, i.e.
  ```JS
  SE.subscribe('/hello/world', ({data}) => {}); // pipeline 1
  SE.subscribe('/hello/world', ({data}) => {}); // pipeline 2
  ```



## Performance
Every decision taken during design was with an intensive care for performance. Please read on to know more about it!

- Usage of DLL for maintaining a list of subscribers. This makes it very efficient during removal of a handler (or a composed handlers)
- Usage of LFU cache to maintain all the pattern matching a pubEvent for an event



## Architecture

![Architecture diagram](https://github.com/AkashBabu/supervised-emitter/blob/master/docs/images/architecture.png)

- Every event at first go through the registered middlewares pipeline
- The output of the middleware pipeline is then feed to every subscription pipeline paralelly (in async manner)
- Any modifications to data in the middleware will be passed to all the subscribers, but any modifications thereafter either to data or the context will be reflected only in the same pipeline.  



## Algorithm

#### General Case (Subscribe first, then publish)
- Supervised-Emitter (SE) is initialized with a bunch of middlewares and certain other options
- A few subscriptions will occur. For this sequence lets assume the following events have been subscribed:
  - `/foo/bar/baz`
  - `/foo/*/baz`
  - `/foo/**`
  - `/foo/boo`
  - `/hello/world`
- Lets say a publish was made on event `/foo/bar/baz`
- The is data is added to the context and the middleware pipeline is invoked
- Now the decision point will check if the published event (pubEvent) is already present in LFU cache (why LFU ? is explain below)
- If present, then the result is returned
- If NOT present, then the decision point will run the match of pubEvent against all the wildcard subscription events and curate a list of matching subEvents and add it to the cache. In this case the following events are matched:
  - `/foo/bar/baz`
  - `/foo/*/baz`
  - `/foo/**`
- Then every matching subscription pipeline is run with the modified context (modified by middlewares)

#### When a new subscription is made
- Every time a new subscription is made, we check if there exists a subEvent with the exact string, if so, then we add this pipeline to the existing DLL (why DLL is explained [here](#design-challenges-faced-during-architecturing))
- Cache is updated if necessary, i.e. if a pubEvent with the same string as subEvent exists.

#### When a new wildcard subscription is made
- In this scenario, the new subscription might match any of the cached pubEvent and hence the wildcard match is checked on all the cached pubEvent, if any match is found, then the corresponding matching subEvents are updated with the new subscription event
- Also this new subscription event is added to wildcard subEvents array. This is done, so that next time if a new pubEvent (not in cache) is received, it shall be checked on all the wildcard events.

#### When an event handler is unsubscribed
- We just remove the handler pipeline from DLL.
- Interesting thing to note here is that, this event is not removed from LFU cache, but it will be done later during publish cycle, if NO handlers are present for the cached event, then the same is removed from the cache and hence will not be available on the next publish cycle.



## API Documentation

**SE.initialize(middlewares, {debug = false, lfu = {max: 100}})**
Param           | Description
:---------------|:-----------
middlewares     | Array of middlewares. Please check [this](#handler-function) for middleware function signature
options         | Options object
options.debug   | When *true*, would print some useful logs for debugging issues related to subscription, unsubscription & publish. *Defaults to false*
options.lfu     | Under the hood we use [lru-cache](https://www.npmjs.com/package/node-lfu-cache) and this option will be passed directly to its constructor. So please read its doc for more information. *Defaults to {max: 100}*

**SE.subscribe(event, ...handlers)**
Param           | Description
:---------------|:-----------
event           | Event to be subscribed (w/ or w/o wildcards).
handlers        | List of handlers. Please read [this](#hanndler-function) for details on handler function signature

**SE.publish(event, data)**
Param           | Description
:---------------|:-----------
event           | Event channel to publish this data.
data            | Anything that you want the subscribers to receive.

Note that it is absolutely possible to use `subscribe` & `publish` methods even before `initialize` is called. This is done to ensure we don't enforce the users to maintain the order. Anyways the order of execution is infact the users responsibility.   
So what happens if we `publish` before `initialize` ? It's the same just that the middlewares would not be run.  
But always remember this will be a singleton no matter what!


#### Handler Function
**function middleware(ctx: {data, pubEvent, subEvents, end}) => data**
Argument        | Description
:---------------|:--------------
ctx             | Context object. This holds the context of the pipeline. If you wanna add methods to be shared by other handlers, then you are free to do so.
ctx.data        | Data `return`ed by every handler will replace this and will be passed on to the next handler
ctx.pubEvent    | Published event. Note that this will be sanitized (i.e. all the empty parts will be removed) hence if you publish on '/hello//world/' then ctx.pubEvent will hold 'hello/world' 
ctx.subEvents   | List of matching subscribed events (w/ or w/o wildcards).

The idea behind using individual context(ctx) for each pipeline is that, the source of change in the context can be easily debugged and reasoned about if some anonymous subscription pipeline is NOT allowed to change the context in this pipeline.


#### Errors
- Invalid pattern  
  All the below patterns are invalid and are easily justifiable:
  - /foo/*/**
  - /foo/**/*
  - /foo/\**/**



## Create custom middlewares
```JS
/// middleware.js
export default function EventTrace({ traceLength = 10 } = {}) {
  const eventTrace = [];
  return ctx => {
    eventTrace.push(ctx.pubEvent);
    if (eventTrace.length > traceLength) eventTrace.shift();

    ctx.printEventTrace = () => {
      for (let i = eventTrace.length - 1; i > -1; i++) {
        console.log(` -> ${eventTrace[i]}`);
      }
    };
  };
}

/// index.js
SE.initialize([EventTrace]);
```



## Caveats
* DO NOT add data in your topic (like foo/bar/item_123) instead add it in your data. Because every new topic would occupy some extra memory.
* Please note that pubEvents and subEvents are sanitized before getting into the system, i.e. empty parts are removed (/foo//bar/baz/ => foo/bar/baz), hence pubEvent & subEvents in the context (ctx) would contain the sanitized-events and not the original event.
* *** or ***.. is considered as a normal string and not as a pattern!!
Order of subscription is not the order of execution for pattern subscribers
CANNOT use patterns for publishing. If used then, it'll be treated as normal strings



## Pattern matches

asdf/* -> asdf/hjkl/ | asdf/qweroiu | asdf/iu1234uiqwer
asdf/** -> adsf/asdf/asdf/ | asdf/qwer | adsf/



## Known security vulnerability
* Any malicious library can import 'Supervised-Emitter' and listen to all the events emitted by this library.



## For those who are keen on knowing the major differences between this library and redux
First and foremost important thing to note is that this library does NO STATE MANAGEMENT, but gives you the possiblity to do so. Please see [this recipe]() on how to implement one by yourself.

So the below comparison is mostly with reducers.
- Boilerplate for using redux in react is huge and also the injection mechanism is inevitable, but SE doesn't need any of it (even for code splitting!!).
- In Redux, there is a risk of a wrong reducer modifying the state, whereas this library provides a `scope` option which will eliminate such risks.
- Redux need to be connect to all the component participating in the communication which inturn needs a lots of boilerplate (more JS mean slower response and more bugs), where SE needs minimal code which makes it ideal to be used even in dumb components.
- Everytime a new reducer is injected, the only way to make that happen is by rebuilding the composed function, but SE makes it relatively easy by just appending an item to DLL list (used internally).
- In redux, none of the reducer can stop the flow of data, but SE provide the capability to do so.
- In redux, every action will have to go through all the reducers irrespective of whether the reducer is really interested in that action or not, but SE target specific handlers.



## Why don't we just use the native event emitter library?
Because of the below features
* Middleware support
* Subscription chaining
* Singleton
* Glob pattern subscription


## Battle tested
You may find the related test-cases in "load/load-test.ts", it also includes test case for memory leakage


## For the curious ones

### Design challenges faced during architecturing
* How to make event handler match performant? 
  * Cache the matched result
  * Which cache to use ? LRU ? LFU ?
    * Choose to use LFU based on heuristics that same events once used will be used more frequently (For instance onChange of input field, form Submit (retry) etc)
* how to maintain scope of an event 
* Chaining subscriptions / unsubscriptions
* how to trace events
* how to maintain state
* how to run middlewares post subscribers

### Design highlights
* Singleton pattern
* DLL instead of array (easier for splicing)
* LFU cache, for storing the matched patterns and update the cache when a new subscription is made
* Glob like pattern matching algorithm
* Subscription chaning (internally unsubscription happens in a recursive manner)
* Event scope




## FAQs
**Why am I getting `undefined` for data in the handlers ?**
- Please check the handler right before this handler (where data is `undefined`) if you're returing any data or not, if not then please return whatever needs to be passed to the next handler.
- If this is the first handler in the pipeline, then check your middleware if it's returning any data or not.



## Benchmarking stats



## Contribution
Please read the [contribution guidelines](https://github.com/AkashBabu/supervised-emitter/blob/master/CONTRIBUTING.md) before raising a PR
For discussion related to a new feature or modifications please raise an issue.