const SE = require('../dist/index');

let i = 0;
bench([
  function subscription() {
    SE.reset();

    SE.subscribe(`/adsf/asdf/${i++}`, () => {});
  },

  function unsubscriptionUniq() {
    SE.reset();

    const subscriptions = [];
    for (let j = 0; j < 1000; j++) {
      subscriptions.push(SE.subscribe(`/adsf/asdf/${j}`, () => {}));
    }

    subscriptions.forEach(subscription => subscription.unsubscribe());
  },

  function unsubscriptionSame() {
    SE.reset();

    const subscription = SE.subscribe('/adsf/asdf/', () => {});
    subscription.unsubscribe();
  },

  function publishNormal() {
    SE.reset();

    for (let j = 0; j < 1000; j++) {
      SE.subscribe('/asdf/qwer/asdf', () => {});
      SE.subscribe('/asdf/asdf/asdf', () => {});
    }

    SE.publish('/asdf/asdf/asdf', 'Hello World');
  },

  function publishGlob() {
    SE.reset();

    for (let j = 0; j < 1000; j++) {
      SE.subscribe('/asdf/qwer/asdf', () => {});
      SE.subscribe('/asdf/*/asdf', () => {});
      SE.subscribe('/**/asdf', () => {});
      SE.subscribe('/asdf/asdf/asdf', () => {});
    }

    SE.publish('/asdf/asdf/asdf', 'Hello World');
  },
], {
  runs: 1000,
});
