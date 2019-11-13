---
description: Before reading on please get yourself familiar with these terminologies
---

# Terminology

#### PubEvent

Just a short form for Published Event.

#### SubEvent

This is also a short form for Subscribed Event

#### Pipeline

Function composition in the reverse direction. i.e, if an array of functions are passed like \[fn1, fn2, ... fnN\], then pipeline is formed by piping the function like =&gt;  `fnN(...fn2(fn1)))`. Read more about pipe and compose [here](https://medium.com/free-code-camp/pipe-and-compose-in-javascript-5b04004ac937).

#### Subscription Pipeline

All handlers hooked to the subEvent. i.e, in`SE.subscribe('foo/bar', handler1, handler2, ..., handlerN)`  all the _handlers_ are piped to form a pipeline like =&gt; `handlerN(...handler2(handler1(ctx))))` .

Only difference between a normal pipeline and subscription pipeline is that, subscription pipeline not only passes the data returned from each handler to the next, but also passes the context in the pipeline. That is, a handler is free to add it own properties to the context and the next handler shall expect it to be present on the context. Also note that the handlers in the pipeline can be async and is still executed sequentially.

Additionally if any handler in the pipeline returns `undefined | nothing` then the flow of the pipeline is stopped immediately. Notice however that NO subscription pipelines will be called if the middleware pipeline is ended.

Below example demonstrates how to add a custom property on `context` :

```javascript
SE.subscribe('foo/bar', 
    (ctx) => {
        ctx.customMethod = () => console.log('hello from custom prop');
        ctx.customVar = 10;
        
        // if this is not returned then,
        // ctx.data will be undefined
        // in the next handler
        return ctx.data;
    },
    (ctx) => {
        ctx.customMethod() // => hello from custom prop
        
        console.log(ctx.customVar) // => 10
        
        return ctx.data;
    }
)
```

Note that, even if the handlers are hooked to the same subEvent \(with exact string albeit w/ or w/o wildcards\) are treated as different pipelines and hence will have individual contexts, i.e.

```javascript
SE.subscribe('/hello/world', (ctx /* context */) => {}); // pipeline 1
SE.subscribe('/hello/world', (ctx) => {}); // pipeline 2

SE.subscribe('foo/bar', (ctx) => {}) // pipeline 3
  .subscribe('foo/bar', (ctx) => {}) // pipeline 4
```

However, the context in the middlewares are carry forwarded and acts as the base context \(context passed to the first handler in the pipeline\) to all the subscription pipelines.

#### Handler \| Subscription handler

Function that will be executed when a match is found between the subscribed event and the published event. Essentially this is one of the functions that will be passed to the `.subscribe('foo/bar', ...handler)` method. 

#### Event Part 

It's a part of the event topic. For ex: If the event is `hello/world`, then `'hello' & 'world'` are event parts. Since this library supports wildcards, you must follow a particular format for naming your event to take advantage of the wildcard feature. So instead of using `_`, `-` or the like, please use `/` as logical separator in your events. For ex: `/foo/bar/baz`

#### DLL

Abbreviation for _Doubly linked list_

#### LFU Cache

Abbreviation for _Least frequently used cache_

