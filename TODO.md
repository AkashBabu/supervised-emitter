# TODO


- [ ] Features
  - [ ] skip() - it must skip all the middlewares
  - [ ] subscribeOnce
  - [ ] pattern subscription in middlewares
  - [ ] ThreadRunner options

- [ ] Performance improvements
  - [ ] Use hashmaps to store the event names against id, then store only the ids in LFU cache for space optimization

- [ ] Create middlewares
  - [ ] Events trace middleware
  - [ ] State management handler

- [ ] Security
  - [ ] Anonymous library can listen to all the events and their data
  
- [ ] Testing
  - [ ] 100% coverage
  - [ ] ThreadRunner testing
  - [x] Segregate test suite (method based)
  - [ ] Solid test cases on utils and the whole library
    - [ ] for ex: what if there are not items in DLL and you still run `shift()`

- [ ] Support
  - [ ] Use a different library for benchmarking
  - [ ] TSDoc
  - [ ] Rollup build
    - [ ] Minified and compressed versions
    - [ ] Dev and prod build
  - [ ] Fix CodeClimate issues
  - [ ] Create Wiki and remove unwanted content in README.md
  - [ ] Improve code segregation (SRP)
    - [ ] for instance remove(event) -> must run all the clean up tasks, such as removing all the handlers, deleting dll, cache cleaning (maybe lazy), event removal etc
  - [ ] Add sample projects
