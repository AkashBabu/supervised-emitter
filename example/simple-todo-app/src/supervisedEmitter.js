const {default: SupervisedEmitter, InternalEvents} = require('supervised-emitter');

const SE = new SupervisedEmitter([], {lifeCycleEvents: true, debug: true});

SE.subscribe(InternalEvents.ON_ERROR, ({data}) => {
  console.error('Publish error:', data.error);
})

export default SE;