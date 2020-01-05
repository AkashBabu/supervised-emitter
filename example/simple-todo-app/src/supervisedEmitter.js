import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter([], {lifeCycleEvents: true, debug: true});

SE.subscribe(SupervisedEmitter.InternalEvents.ON_ERROR, ({data}) => {
  console.error('Publish error:', data.error);
})

export default SE;