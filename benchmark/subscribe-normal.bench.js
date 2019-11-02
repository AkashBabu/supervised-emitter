const SupervisedEmitter = require('../').default;

const N = 10000;
bench([
  function sub_same_topic() {
    const SE = new SupervisedEmitter();

    for (let i = 0; i < N; i++) {
      SE.subscribe('/hello/world/is/now/big', () => { });
    }
  },
  function sub_different_topics() {
    const SE = new SupervisedEmitter();

    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}/times`, () => { });
    }
  },
], {
  runs: 10,
  reporter: require('./reporter'),
});
