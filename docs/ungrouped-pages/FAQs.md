---
description: Frequently asked questions
---

# FAQs

**Why are all the handler not called in subscription handlers ?**

* Please check the handler right before this handler \(where data is `undefined`\) if you're returning any data or not, if not then please return whatever needs to be passed to the next handler.
* If this is the first handler in the pipeline, then check your middleware if it's returning any data or not.

