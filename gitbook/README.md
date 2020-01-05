# Introduction

Well everything in web-space is _events \(onClick, onHover, onReqReceived etc\),_ so why shouldn't the underlying libraries or frameworks also be in the same paradigm and hence this library was created. 

But there seems to be lots of features missing in the currently existing pub-sub or event-emitter libraries, which makes it less popular or not useful in modern web applications. Modern web application have demanding needs such as debuggability, composability, reproducibility etc, which have been considered in the design of **Supervised-Emitter** (any suggestions for a better name will be greatly appreciated!)

This is a very small library written in typescript and hence would suggest y'all to take a look at the source code for a greater understanding of how this library works and if you like it, add a star!

> **NOTE**  
This library follows a convention (rather strictly) of using `/` for separating the event logically. For example if you were to create a subscription on `req_GET_details` then we strongly recommend you to use `req/GET/details` instead. Because every string in between `/` is treated as an event part and has special meaning when using wildcard subscriptions. So for uniformity we suggest you to use `/` everywhere.   
Read more about wildcard subscriptions [here](wildcard-subscriptions.md).

There are a couple of reasons for creating this library, here are the [list of features](features.md) that one can get by adopting this event-emitter library.

## Getting started

For basic usage visit this [page](basics/usage.md)

If you wish to learn with step-by-step guidance, then start [here](basics/step-by-step-tutorial.md) 

Else, if you prefer running an example app first, then run the following commands:

> cd example/todo-app  
> npm i  
> npm start

## Contribution
Please read the [contribution guidelines](https://github.com/AkashBabu/supervised-emitter/blob/master/CONTRIBUTING.md) before raising a PR.  
For discussion related to a new feature or modifications please raise an issue [here](https://github.com/AkashBabu/supervised-emitter/issues).
