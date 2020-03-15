# TASKS

- [ ] Features
  - [x] Await on `.subscribeOnce()`, so that orchestration of a flow can be written in a more readable manner

- [ ] Performance improvements
  - [ ] Use hashmaps to store the event names against id, then store only the ids in LFU cache for space optimization

- [ ] Create middlewares
  - [ ] Events trace middleware
  - [ ] State management handler

- [ ] CI Setup
  - [ ] Setup Semantic Release in the project and CI
  - [ ] Move rollup build, tsc build, benchmark, load testing semantic release, update-tsdoc to CI
  - [ ] adds package testing, i.e, npm run pack and run a plain node script to test its working

- [ ] Support
  - [ ] Migrate from gitbook to [docusaurus](https://docusaurus.io/docs/en/installation)
  - [ ] Use a different library for benchmarking
  - [ ] Improve code segregation (SRP)
    - [ ] for instance remove(event) -> must run all the clean up tasks, such as removing all the handlers, deleting
  - [ ] Add sample projects
  - [ ] Explain todo example app

- [ ] Explain the difference between redux and supervised-emitter in case of
  - [ ] fetch data and sort it and only then the data must be displayed