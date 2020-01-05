# For the curious ones

## Performance

Lots of attention has been paid since inception to ensure greater efficiency in this library. Please read on to know more about it! The below pointers can give you a gist of the library:

* Usage of [DLL](https://www.npmjs.com/package/@akashbabu/node-dll) for maintaining a list of subscribers. This makes it very efficient during removal of a [handler](terminology.html#handler) \(or a [pipeline](terminology.html#subscription-pipeline)\)
* Usage of [LFU cache](https://www.npmjs.com/package/@akashbabu/lfu-cache) to maintain all subEvents matching a pubEvent.

Also note that the pre-commit hook scripts include test, load & benchmarking amongst the rest of them to assure you that we don't fall out of our boundary limits \(both in terms of memory and time\).

## Battle tested

This library has been rigorously tested to work in a battle environment \(large scale apps with a huge number of events\).  
You may find the related test-cases [here](https://github.com/AkashBabu/supervised-emitter/blob/master/load/load-test.ts), it also includes test case for memory leakage detection.


## Design challenges faced during architecting

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

## Design highlights

* DLL instead of array \(easier for splicing\)
* LFU cache, for storing the matched patterns and update the cache when a new subscription is made
* Glob like pattern matching algorithm
* Subscription chaning \(internally unsubscription happens in a recursive manner\)
* Event scope
