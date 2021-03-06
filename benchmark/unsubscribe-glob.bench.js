const SupervisedEmitter = require('../');
const SE = new SupervisedEmitter();

const N = 10000;
bench([
  function gunsub_same_topic() {
    const SE = new SupervisedEmitter();

    const subscriptions = [];
    for (let i = 0; i < N / 2; i++) {
      subscriptions.push(SE.subscribe('/hello/world/*', () => { }));
      subscriptions.push(SE.subscribe('/hello/**', () => { }));
    }

    subscriptions.forEach(subscription => subscription.unsubscribe());
  },

  function gunsub_different_topics() {
    const SE = new SupervisedEmitter();

    const subscriptions = [];
    for (let i = 0; i < N / 2; i++) {
      subscriptions.push(SE.subscribe(`/hello/world/${i}/*`, () => { }));
      subscriptions.push(SE.subscribe(`/hello/${i}/**`, () => { }));
    }

    subscriptions.forEach(subscription => subscription.unsubscribe());
  },

  function chained_gunsub_same_topics() {
    const SE = new SupervisedEmitter();

    let subscription = SE.subscribe('/hello/world/*', () => { });
    for (let i = 0; i < N / 2; i++) {
      subscription = subscription.subscribe('/hello/world/*', () => { })
        .subscribe('/hello/**', () => { });
    }

    subscription.unsubscribe();
  },

  function chained_gunsub_different_topics() {
    const SE = new SupervisedEmitter();

    let subscription = SE.subscribe('/hello/world/*', () => { });
    for (let i = 0; i < N / 2; i++) {
      subscription = subscription.subscribe(`/hello/world/${i}/*`, () => { })
        .subscribe(`/hello/${i}/**`, () => { });
    }

    subscription.unsubscribe();
  },
], {
  runs: 10,
  reporter: require('./reporter'),
});
