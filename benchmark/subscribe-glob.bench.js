const SupervisedEmitter = require('../');

const N = 10000;
bench([
  function gsub_same_topic() {
    const SE = new SupervisedEmitter();
    
    for (let i = 0; i < N / 2; i++) {
      SE.subscribe('/hello/world/*/big', () => { });
      SE.subscribe('/hello/world/**/big', () => { });
    }
  },
  function gsub_different_topics() {
    const SE = new SupervisedEmitter();

    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}/*/times`, () => { });
    }
  },
], {
  runs: 10,
  reporter: require('./reporter'),
});
