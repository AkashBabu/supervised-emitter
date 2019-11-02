# 0.6.0
* Usage of Classes instead of singleton
  * This helped us overcome Security issues when a malicious library could listen to all the events in the application
* Adds test cases for ThreadRunner
* Adds `.map()` method to dll
* Semantic renaming of variables in supervisedEmitter class
* ThreadRunner gracefully handles the errors thrown in publish pipeline
* Adds Typescript API doc in the build pipeline

# 0.5.0
* Removal of support Node: 7
* Migration to TS(Typescript)
* Load testing progress indicators
* Usage of Array instead of DLL for Thread Runner to improve efficiency
* Handles errors during publish
* Improved documentation
* Removes publish benchmark as async benchmarking is not supported by radargun

# v0.4.0
* Bug Fix: wasn't ignoring leading & trailing '/' in normal event subscription
* Improved documentation
* Added more test cases
* Load tested
* Benchmarking & report creation for the same
* Controlled concurrency for publish pipelines
* Improves code segregation

# v0.3.0
* Bug Fix: normal event subscription wasn't being updated in cache
* Adds `subEvents` to the context (ctx)
* Adds support for stopping the flow inbetween a pipeline execution
* Adds support for Debug logs

# v0.2.1
* Replaces `JS Object` with `Map` for better efficiency

# v0.2.0
* Bug Fixes: state was not being refreshed on `reInitialize`
* Removes state initialization code duplication
* Adds test cases for `DLL`


# v0.1.0
* Initial Commit