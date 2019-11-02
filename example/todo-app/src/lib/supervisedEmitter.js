import SupervisedEmitter from '../../../..';

const SE = new SupervisedEmitter([EventTraceMiddleware()], {
  debug              : true,
  publishConcurrency : 10,
});

// Middlewares

function EventTraceMiddleware({ traceLength = 10 } = {}) {
  const eventTrace = [];
  return ctx => {
    eventTrace.push({
      date     : new Date(),
      pubEvent : ctx.pubEvent,
    });
    if (eventTrace.length > traceLength) eventTrace.shift();

    ctx.printEventTrace = () => {
      for (let i = eventTrace.length - 1; i > -1; i--) {
        console.log(` -> ${eventTrace[i].date.toISOString()} ${SE.unScope(eventTrace[i].pubEvent)}`); // eslint-disable-line
      }
    };

    return ctx.data;
  };
}


export default SE;
