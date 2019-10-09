const SE = require('../dist/index');

const N = 10000;
bench([
  function pub_same_topic() {
    SE.reset();

    for (let i = 0; i < N; i++) {
      SE.publish('/hello/world', 'data');
    }
  },

  function pub_different_topics() {
    SE.reset();

    for (let i = 0; i < N; i++) {
      SE.publish(`/hello/world/${i}`, 'data');
    }
  },

  function pub_normal_subscribers_same_topic() {
    SE.reset();

    SE.subscribe('/hello/world', () => {});

    for (let i = 0; i < N; i++) {
      SE.publish('/hello/world', 'data');
    }
  },

  function pub_normal_subscribers_different_topics() {
    SE.reset();

    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}`, () => {});
    }

    for (let i = 0; i < N; i++) {
      SE.publish(`/hello/world/${i}`, 'data');
    }
  },

  function pub_same_topic_single_glob_subscriber() {
    SE.reset();

    SE.subscribe('/hello/*', () => {});
    SE.subscribe('/hello/**', () => {});

    for (let i = 0; i < N; i++) {
      SE.publish('/hello/world', 'data');
    }
  },

  function pub_different_topic_single_glob_subscriber() {
    SE.reset();

    SE.subscribe('/hello/world/*', () => {});
    SE.subscribe('/hello/**', () => {});

    for (let i = 0; i < N; i++) {
      SE.publish(`/hello/world/${i}`, 'data');
    }
  },

  function pub_glob_subscribers_different_topics() {
    SE.reset();

    SE.subscribe('/hello/**', () => {});
    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}/*`, () => {});
    }

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < 10; j++) {
        SE.publish(`/hello/world/${i}/${j}`, 'data');
      }
    }
  },
], {
  runs     : 10,
  reporter : require('./reporter'),
});
