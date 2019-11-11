# Wildcard subscriptions

#### Why we chose wildcard subscription?

Primarily there are two types of event subscriptions: Normal event subscriptions & Wildcard event subscriptions.    
    Normal event subscriptions are very easy to match with the [pubEvent](terminology.md#pubevent), as it is a direct string comparison and we could use hashmap for the purpose.  
    Where as Wildcard event subscriptions needs some pattern matching algorithm. Straight forward solution to the pattern matching algorithm would be `RegExp`, since it is completely customizable, but it is slow :\( 

So we chose to go with wildcards. It is not completely customizable, but covers most of the cases. Now the comparison has to be made against each [part of the event](terminology.md#event-part), which is much faster than RegEx \(Regular expressions\) matching.

| Pattern | Matching string |
| :--- | :--- |
| foo/\* | `foo/\<anything>`, `/foo/\<anything>`, `/foo/\<anything>/` |
| foo/\*/bar | `foo/\<anything>/bar`, `/foo/\<anything>/bar`, `/foo/\<anything>/bar/` |
| foo/\*\* | `foo/\<anything>/\<anything>/...`,  `/foo/\<anything>/\<anything>/...` |
| foo/\*\*/bar | `foo/\<anything>/\<anything>/.../bar`,  `/foo/\<anything>/\<anything>/.../bar` |

However the below patterns are considered to be invalid and is easily justifiable:

* /foo/\*\*/_\*_
* /foo/\*/\*\*
* /foo/\*\*/\*\*

