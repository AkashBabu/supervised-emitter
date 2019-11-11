# Introduction

Well everything in web-space is _events \(onClick, onHover, onReqReceived etc\),_ so why shouldn't the underlying libraries or frameworks also be in the same paradigm and hence this library was created. 

But there seems to be lots of features missing in the currently existing pub-sub or event-emitter libraries, which makes it less popular or not useful in modern web applications. Modern web application have demanding needs such as debuggability, composability, reproducibility etc, which have been considered in the design of **Supervised-Emitter** \(any other suggestions for a better name will be greatly appreciated!\)

This is a very small library written in typescript and hence would suggest all of you to take a look at the source code for a greater understanding of how this library works!

{% hint style="info" %}
This library follows a convention \(rather strictly\) of using `/` for separating the event logically. For example if you were to create a subscription on `req_GET_details` then we strongly recommend you to use `req/GET/details` instead. Because every string in between `/` is treated as an event part and has special meaning when using wildcard subscriptions. So for uniformity we suggest you to use `/` everywhere. Please read more about wildcard subscriptions [here](wildcard-subscriptions.md).
{% endhint %}

There are a couple of reasons for creating this library, here are the [list of features](features.md) that one can get by adopting this event-emitter library.

## Performance

Lots of attention has been paid since inception to ensure greater efficiency in this library. Please read on to know more about it! The below pointers can give you a gist of the library:

* Usage of DLL for maintaining a list of subscribers. This makes it very efficient during removal of a handler \(or a composed handlers\)
* Usage of LFU cache to maintain all subEvents matching a pubEvent.

Also note that the pre-commit hook scripts include test, load & benchmarking amongst the rest of them to assure you that we don't fall out of our boundary limits \(both in terms of memory and time\).

## Battle tested

This library has been rigorously tested to work in a battle environment \(large scale apps with a huge number of events\).  
You may find the related test-cases [here](https://github.com/AkashBabu/supervised-emitter/blob/master/load/load-test.ts), it also includes test case for memory leakage detection.

## For the curious ones

### Design challenges faced during architecting

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

* DLL instead of array \(easier for splicing\)
* LFU cache, for storing the matched patterns and update the cache when a new subscription is made
* Glob like pattern matching algorithm
* Subscription chaning \(internally unsubscription happens in a recursive manner\)
* Event scope

## Run example todo app

> cd example/todo-app  
> npm i  
> npm start

