# Supervised-Emitter \(SE\)

## Table of contents

* [Introduction](./#introduction)
* [Installation](./#installation)
* [Usage](./#usage-in-reactjs)
* [Feature list](./#feature-list)
  * [Why we chose wildcard subscription?](./#why-we-chose-wildcard-subscription)
* [Terminologies](./#before-reading-on)
* [Performance](./#performance)
* [Architecture](./#architecture)
* [Pattern matches](./#pattern-matches)
* [Create custom middlewares](./#create-custom-middlewares)
* [Caveats](./#caveats)
* [For the curious ones](./#for-the-curious-ones)
* [Run example todo app](./#run-example-todo-app)

## Introduction

Another pub-sub library huh!!! Hey hold on... there's a lot more features like middleware capability, chaining subscriptions, pattern subscription and more.

This library has been built with a lot of focus on its application in React projects \(hope it finds other applications as well\). Please read on to find out more about it...

Visit [this page](https://github.com/AkashBabu/supervised-emitter/blob/master/tsdocs/README.md) for API docs. Visit [wiki](https://github.com/AkashBabu/supervised-emitter/wiki) for more information on this project

### Why don't we just use the native event emitter library?

Because of the below features

* Middleware support
* Subscription chaining
* Singleton
* Glob pattern subscription

## Installation

> npm i supervised-emitter --save

## Usage in ReactJS

```jsx
/// index.jsx
import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter();
export default SE;

/// componentA.jsx
import SE from './index.jsx';
import React from 'react'

export default function ComponentA() {
  function handleClick() {
    SE.publish('btn/clicked', 'some-data');
  }

  return <button onClick={handleClick}>Click me!</button>
}


/// componentB.jsx
import SE from './index.jsx';
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

* Written in typescript for robust APIs
* Support for middlewares
  * Now you can listen to all the published events and modify the content or even stop the flow of data in the pipeline.
* Composibility
  * There need not be just one handler, but multiple handlers where the output of one is piped into the next handler. For ex:

    ```javascript
    SE.subscribe('/hello/world', 
      ({data}) => data + 1, 
      ({data}) => console.log(data); //=> 2
    );

    SE.publish('/hello/world', 1)
    ```
* Support for wildcard subscriptions
  * No more plain event subscriptions, which means you can listen to a bunch of events with a simple wildcard pattern. For ex:

    ```javascript
    SE.subscribe('/hello/*', () => {})
    SE.subscribe('hello/**', () => {})
    ```

  * '\*' would match one unmatched part. 
    * For ex: `/cat/*/bat`   

      Match SUCCESS `/cat/rat/bat`, `/cat/mat/bat`, `/cat/asdf/bat`  

      Match FAIL    `/cat/rat/rat`, `/cat/asdf/sdf/asdf`, `/cat/bat`
  * '\*\*' would match more than one unmatched part. 
    * For ex: `/cat/**/bat`  

      Match SUCCESS `/cat/rat/bat`, `/cat/rat/mat/bat`, `/cat/bat`  

      Match FAIL    `/cat/rat/rat`
* Chaining subscriptions
  * You can chain a list of subscriptions and unsubscribe at once instead of subscribing / unsubscribing for each event. Please read [API Documentation](./#api-documentation) for more details.

    ```javascript
    const subscription = SE.subscribe('/foo/bar', () => {})
    .subscribe('/lion/rat', () => {})
    .subscribe('btn/*', () => {})

    subscription.unsubscribe();
    ```
* Most importantly, you don't have to specify the event-name and the handler function during unsubscription 😜, instead it's as easy as `subscription.unsubscribe()`
* Supports async handlers
  * Every handler in the pipeline is `await`ed
* You can await on Publish action
* Can stop the flow of data in between a pipeline
* Can publish scoped events!!!
  * This mean you can have multiple instances of the same component, but can still operate in isolation.
* Don't have to worry about multiple slashes, leading slash\(/\) & trailing slash\(/\)
  * Every event is sanitized before being used in the system. Hence `/hello/world`, `hello/world/` & `///hello//world/` would all MEAN THE SAME
* Use it everywhere, irrespective of whether you use React / Vue / Angular / Vanilla JS
* Controlled rate of publishes at a time
  * This ensures that we don't run out of Memory causing page crashes.

    &lt;!-- - TCO\([Tail call optimization](https://stackoverflow.com/a/310980)\) subscription chain
* TCO\([Tail call optimization](https://stackoverflow.com/a/310980)\) pipelines --&gt;

#### Why we chose wildcard subscription?

Primarily there are two types of event subscriptions: Normal event subscriptions & Wildcard event subscriptions.  
Normal event subscriptions are very easy to match with the pubEvent, as it is a direct string comparison and we could use hashmap for the purpose.  
Where as Wildcard event subscriptions needs some pattern matching algorithm. Straight forward solution to the pattern matching algorithm would be `RegExp`, since it is completely customizable, but it is slow :\( So we chose to go with wildcards. It is not completely customizable, but covers most of the cases. Now the comparison has to be made against each part of the event, which is much faster than RegExp matching.

## Before reading on

Please get yourself familiar with these terminologies before reading on...

* _pubEvent_ : Published Event
* _subEvent_ : Subscribed Event
* _handler \| subscription handler_ : Function that will be executed when a match is found between the subscribed event and the published event. Essentially this is one of the functions that will be passed to the `.subscribe('foo/bar', ...handler)` method. 
* _matching Events_ : All the matching subscribed pattern events for the published event
* _LFU cache_ : Least Frequently used cache
* _DLL_ : Doubly linked list
* _event part_ : It's a part of the event topic. For ex: If the event is `hello/world`, then `hello, world` are event parts. Since this library supports wildcards, you must follow a particular format for naming your event to take advantage of the wildcard feature. So instead of using `_`, `-` or the like, please use `/` as logical seperator in your events. For ex: `/foo/bar/baz`
* _pipeline_ : Function composition in the reverse direction. Please read [this](https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937) for more information on pipe
* _subscription pipelines_ : All pipelines hooked to the subEvent that matches the pubEvent. Please note that, even if the handlers are hooked to the same subEvent \(with exact string albeit w/ or w/o wildcards\) are treated as different pipelines and hence will have individual contexts, i.e.

  ```javascript
  SE.subscribe('/hello/world', ({data}) => {}); // pipeline 1
  SE.subscribe('/hello/world', ({data}) => {}); // pipeline 2
  ```

## Performance

Every decision taken during design was with an intensive care for performance. Please read on to know more about it!

* Usage of DLL for maintaining a list of subscribers. This makes it very efficient during removal of a handler \(or a composed handlers\)
* Usage of LFU cache to maintain all the pattern matching a pubEvent for an event

## Architecture

![Architecture diagram](https://github.com/AkashBabu/supervised-emitter/blob/master/docs/images/architecture.png)

* Every event at first go through the registered middlewares pipeline
* The output of the middleware pipeline is then fed to every subscription pipeline parallelly \(in async manner\)
* Any modifications to data in the middleware will be passed to all the subscribers, but any modifications thereafter either to data or the context will be reflected only in the same pipeline.  

## Pattern matches

| Pattern | Matching string |
| :--- | :--- |
| foo/\* | `foo/\<anything>`, `/foo/\<anything>`, `/foo/\<anything>/` |
| foo/\*/bar | `foo/\<anything>/bar`, `/foo/\<anything>/bar`, `/foo/\<anything>/bar/` |
| foo/\*\* | `foo/\<anything>/\<anything>/...`,  `/foo/\<anything>/\<anything>/...` |
| foo/\*\*/bar | `foo/\<anything>/\<anything>/.../bar`,  `/foo/\<anything>/\<anything>/.../bar` |

However the below pattern are considered to be invalid and would result in error.

* /foo/_/\*_
* /foo/_\*/_
* /foo/\*_/\*_

## Create custom middlewares

```javascript
/// middleware.js
export default function EventTraceMiddleware({ traceLength = 10 } = {}) {
  const eventTrace = [];
  return ctx => {
    eventTrace.push({date: new Date(), pubEvent: ctx.pubEvent});
    if (eventTrace.length > traceLength) eventTrace.shift();

    ctx.printEventTrace = () => {
      for (let i = eventTrace.length - 1; i > -1; i--) {
        console.log(` -> ${eventTrace[i].date.toISOString()} ${eventTrace[i].pubEvent}`);
      }
    };

    // This is very very important. Only then shall the next 
    // middleware receive data else nothing `data` will be undefined
    return ctx.data;
  };
}

/// index.js
SE.initialize([EventTraceMiddleware]);
```

## Caveats

* DO NOT add data in your topic \(like foo/bar/item\_123\) instead add it in your data. Because every new topic would occupy some extra memory.
* Please note that pubEvents and subEvents are sanitized before getting into the system, i.e. empty parts are removed \(/foo//bar/baz/ =&gt; foo/bar/baz\), hence pubEvent & subEvents in the context \(ctx\) would contain the sanitized-events and not the original event.
*  _**or**_ .. is considered as a normal string and not as a pattern!!

  Order of subscription is not the order of execution for pattern subscribers

  CANNOT use patterns for publishing. If used then, it'll be treated as normal strings

## Battle tested

This library has rigorously tested to work in a battle environment \(large scale apps with a huge number of events\).  
You may find the related test-cases in "load/load-test.ts", it also includes test case for memory leakage detection.

## For the curious ones

### Design challenges faced during architecturing

* How to make event handler match performant? 
  * Cache the matched result
  * Which cache to use ? LRU ? LFU ?
    * Choose to use LFU based on heuristics that same events once used will be used more frequently \(For instance onChange of input field, form Submit \(retry\) etc\)
* how to maintain scope of an event?
  * By creating a closure that adds a random \(never colliding\) part as a suffix to the event and the same closure must be used by the publisher and subscriber
* Chaining subscriptions / unsubscriptions
  * How to unsubscribe from all the subscriptions at once ??
    * Used scope \(closure\) and recursion methods to unsubscribe from all the chained subscriptions at once
* how to trace events?
  * Add a middleware that updates entries of all the published events and adds `.printEventTrace()` method to the context, so that it can be accessed in all handlers
* how to maintain state?
  * Create a subscriber that listens on a glob pattern like `save_state/**` and maintain a state tree, then publish the data to be saved on events like `save_state/login`
* how to run middlewares post subscribers?
  * You can't do that, but instead you can publish events post your logic. For instance you may publish event like `__only_middlewares/foo/bar` after executing your logic in any subscription handler.

### Design highlights

* Singleton pattern
* DLL instead of array \(easier for splicing\)
* LFU cache, for storing the matched patterns and update the cache when a new subscription is made
* Glob like pattern matching algorithm
* Subscription chaning \(internally unsubscription happens in a recursive manner\)
* Event scope

## Run example todo app

> cd example/  
> npm i  
> npm start

## API documentation

Please visit [this page](https://github.com/AkashBabu/supervised-emitter/blob/master/tsdocs/README.md) for API documentation.

## FAQs

For FAQs please visit this [wiki](https://github.com/AkashBabu/supervised-emitter/wiki/FAQs)

## Benchmarking stats

Please find the benchmarks at [BENCHMARK.md](https://github.com/AkashBabu/supervised-emitter/blob/master/BENCHMARK.md)

## Contribution

Please read the [contribution guidelines](https://github.com/AkashBabu/supervised-emitter/blob/master/CONTRIBUTING.md) before raising a PR For discussion related to a new feature or modifications please raise an issue.

