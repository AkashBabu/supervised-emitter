# Orchestrating a flow in Supervised-Emitter

Traditionally this was only possible with the use of libraries like redux-saga.
But the problem is, it adds to the size of the bundle.
More over, there is a popular saying that `the best code is NO code at all`, because if there is less code then there is less to debug and maintain.
With the introduction of redux-saga and other libraries like reselect etc, we add up more and more code alongside the business logic.

So presenting to you the solution to be Supervised-Emitter. This helps to eliminate redux-saga and still be able to achieve orchestration in the application.

But before you read more about `how` below, please get out of the context of redux-sagas conventions or any other libraries that you are currently using and then continue to read about this. Because you'll be able to understand or accept only if you know nothing (or atlead think that you know nothing!).

After all Supervised Emitter is an event emitter library, but with extra capability of awaiting on an Async subscription pipeline.
So let's look at a scenario of orchestrating a data fetch and then sorting the fetched data and then render the same.

```JS
SE.subscribe('data/req/success', ({data}) => {
  SE.publish('data/render', data.sort())
})

SE.publish('data/req/initiate', {id});
```