# Code Splitting

By nature, any event-emitter library can grow without any hassles of injecting new subscribers or the like. So when a page a lazy loaded, so is the subscribers associated with the page also lazily attached to the Event-emitter instance and **Supervised-Emitter** is NO different in this concept, but to make it efficient to attach/remove a new subscription pipeline, DLL is used under-the-hood

