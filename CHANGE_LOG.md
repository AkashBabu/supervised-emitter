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