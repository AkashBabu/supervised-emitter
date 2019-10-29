import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import SE from 'supervised-emitter'

import './index.scss'

SE.initialize([EventTraceMiddleware()], {debug: true});

ReactDOM.render(<App />, document.getElementById('app'));




// SE middlewares

function EventTraceMiddleware({ traceLength = 10 } = {}) {
  const eventTrace = [];
  return ctx => {
    eventTrace.push({date: new Date(), pubEvent: ctx.pubEvent});
    if (eventTrace.length > traceLength) eventTrace.shift();

    ctx.printEventTrace = () => {
      for (let i = eventTrace.length - 1; i > -1; i--) {
        console.log(` -> ${eventTrace[i].date.toISOString()} ${eventTrace[i].pubEvent}`);
      }
    };

    return ctx.data;
  };
}
