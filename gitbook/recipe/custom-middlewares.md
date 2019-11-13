---
description: Explains how to create a custom middleware
---

# Custom Middlewares

```javascript
/// middleware.js
export default function EventTraceMiddleware({ traceLength = 10 } = {}) {
  const eventTrace = [];
  return ctx => {
    eventTrace.push({date: new Date(), pubEvent: ctx.pubEvent});
    if (eventTrace.length > traceLength) eventTrace.shift();

    ctx.printEventTrace = () => {
      for (let i = eventTrace.length - 1; i > -1; i--) {
        console.log(` -> ${eventTrace[i].date.toISOString()} ${eventTrace[i].pubEvent}`);
      }
    };

    // This is very very important. Only then shall the next 
    // middleware receive data else nothing `data` will be undefined
    return ctx.data;
  };
}

/// index.js
SE.initialize([EventTraceMiddleware]);
```

## 

