---
description: Common pitfalls identified during the usage of this library
---

# Caveats

* DO NOT add data in your topic \(like foo/bar/item\_123\) instead add it in your data. Because every new topic would occupy some extra memory and would slow down the matching algorithm.
* Please note that pubEvents and subEvents are sanitized before getting into the system, i.e. empty parts are removed \(/foo//bar/baz/ =&gt; foo/bar/baz\), hence pubEvent & subEvents in the context \(ctx\) would contain the sanitized-events and not the original event.
* _**\*\*\* or \*\*\*...**_ is considered as a normal string and not as a pattern!!
* Order of subscription is not the order of execution for pattern subscribers
* CANNOT use patterns for publishing. If used then, it'll be treated as normal strings



