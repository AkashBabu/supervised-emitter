---
description: Why this library ?
---

# Features

* Written in typescript for robust APIs
* Support for middlewares
  * Now you can listen to all the published events and modify the content or even stop the flow of data in the pipeline.
* Composability
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

  * '\*' would match part irrespective of any string. 
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
* Don't have to worry about multiple slashes\(//\), leading slash\(/\) & trailing slash\(/\)
  * Every event is sanitized before being used in the system. Hence `/hello/world`, `hello/world/` & `///hello//world/` would all MEAN THE SAME
* Use it everywhere, irrespective of whether you use React / Vue / Angular / Vanilla JS
* Controlled rate of publishes at a time
  * This ensures that we don't run out of Memory causing page crashes.



