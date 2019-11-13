# Road Map


- [x] Features
  - [x] Life cycle events
    - [x] init -> when SE has been bootstrapped and the middleware pipeline has been setup
    - [x] onSubscribe -> when a listener has been hooked
          * This can be used to rehydrate the state (like redux-persist)
    - [x] onUnsubscribe -> when a listener has been removed
  - [x] ~~skip() - it must skip all the middlewares~~
  - [x] subscribeOnce
  - [x] pattern subscription in middlewares
  - [x] ThreadRunner options
  - [x] Removed `end()` method from IContext, instead `return`ing `nothing | undefined` shall stop the flow of pipele

- [ ] Performance improvements
  - [ ] Use hashmaps to store the event names against id, then store only the ids in LFU cache for space optimization

- [ ] Create middlewares
  - [ ] Events trace middleware
  - [ ] State management handler

- [x] Security
  - [x] Anonymous library can listen to all the events and their data

- [x] Testing
  - [x] 100% coverage
  - [x] ThreadRunner testing
  - [x] Solid test cases on utils and the whole library
    - [x] for ex: what if there are not items in DLL and you still run `shift()`
  - [x] Segregate test suite (method based)

- [ ] Support
  - [ ] Use a different library for benchmarking
  - [x] TSDoc
  - [x] Rollup build
    - [x] Minified and compressed versions
    - [x] Dev and prod build
  - [x] Fix CodeClimate issues
  - [x] Create Wiki and remove unwanted content in README.md
  - [ ] Improve code segregation (SRP)
    - [ ] for instance remove(event) -> must run all the clean up tasks, such as removing all the handlers, deletinglc
  - [x] Add sample projects
  - [ ] Explain todo example app

- [ ] Explain the difference between redux and supervised-emitter in case of
  - [ ] fetch data and sort it and only then the data must be displayed