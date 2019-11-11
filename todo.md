# TODO

* [ ] Features
  * [ ] skip\(\) - it must skip all the middlewares
  * [ ] subscribeOnce
  * [ ] pattern subscription in middlewares
  * [x] ThreadRunner options
* [ ] Performance improvements
  * [ ] Use hashmaps to store the event names against id, then store only the ids in LFU cache for space optimization
* [ ] Create middlewares
  * [ ] Events trace middleware
  * [ ] State management handler
* [x] Security
  * [x] Anonymous library can listen to all the events and their data
* [ ] Testing
  * [ ] 100% coverage
  * [x] ThreadRunner testing
  * [x] Solid test cases on utils and the whole library
  * [x] for ex: what if there are not items in DLL and you still run `shift()`
  * [x] Segregate test suite \(method based\)
* [ ] Support
  * [ ] Use a different library for benchmarking
  * [ ] TSDoc
  * [ ] Rollup build
  * [ ] Minified and compressed versions
  * [ ] Dev and prod build
  * [ ] Fix CodeClimate issues
  * [ ] Create Wiki and remove unwanted content in README.md
  * [ ] Improve code segregation \(SRP\)
  * [ ] for instance remove\(event\) -&gt; must run all the clean up tasks, such as removing all the handlers, deleting dll, cache cleaning \(maybe lazy\), event removal etc
  * [ ] Add sample projects
  * [ ] Explain todo example app
* [ ] Explain the difference between redux and supervised-emitter in case of
  * [ ] fetch data and sort it and only then the data must be displayed

