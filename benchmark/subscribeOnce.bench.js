const SupervisedEmitter = require('../');

const N = 10000;
bench([
  function sub_once() {
    const SE = new SupervisedEmitter();
    
    for (let i = 0; i < N; i++) {
      SE.subscribeOnce('/hello/world/', () => { });
      SE.subscribeOnce('/hello/world/*/big', () => { });
      SE.subscribeOnce('/hello/**', () => { });
    }
  }
], {
  runs: 10,
  reporter: require('./reporter'),
});
