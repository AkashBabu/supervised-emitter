# TASKS

- [ ] Features
  - [ ] add Error hook to life-cycle events

- [ ] Performance improvements
  - [ ] Use hashmaps to store the event names against id, then store only the ids in LFU cache for space optimization

- [ ] Create middlewares
  - [ ] Events trace middleware
  - [ ] State management handler

- [ ] Support
  - [ ] Migrate from gitbook to [docusaurus](https://docusaurus.io/docs/en/installation)
  - [ ] Use a different library for benchmarking
  - [ ] Improve code segregation (SRP)
    - [ ] for instance remove(event) -> must run all the clean up tasks, such as removing all the handlers, deletinglc
  - [ ] Add sample projects
  - [ ] Explain todo example app

- [ ] Explain the difference between redux and supervised-emitter in case of
  - [ ] fetch data and sort it and only then the data must be displayed