const SupervisedEmitter = require('../').default;
const SE = new SupervisedEmitter();

const N = 10000;
bench([
  function sub_same_topic() {
    SE.reset();

    for (let i = 0; i < N; i++) {
      SE.subscribe('/hello/world/is/now/big', () => { });
    }
  },
  function sub_different_topics() {
    SE.reset();

    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}/times`, () => { });
    }
  },
], {
  runs: 10,
  reporter: require('./reporter'),
});
