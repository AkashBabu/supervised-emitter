/* eslint no-await-in-loop: off */
/* eslint complexity: off */

import { expect } from 'chai';
import delay from 'delay';
import cliProgress from 'cli-progress';

import SE from '../src';


let calls = 0;
function resetCount() {
  calls = 0;
}
function incrementCount() {
  calls++;
}

async function asyncIncrementCount() {
  await delay(Math.random() * 90 + 10);
  calls++;
}

const rand = (n, m = 0) => Math.floor((Math.random() * n) - 0.01) + m;
const predicate = () => Math.round(Math.random()) === 0;
const range = n => new Array(n).fill(0);

const words = [
  ['request', 'save'],
  ['home', 'about', 'contact', 'list'],
  ['success', 'failed', 'loading'],
];

const events = range(100).map(() => words.map(w => w[rand(w.length)])
  .join('/'));

function getEvent() {
  let event;
  do {
    event = events[rand(events.length)];
  } while (!event);
  return event;
}
function getGlobEvent() {
  const globIndex = rand(words.length);

  return words.map((w, i) => {
    if (i === globIndex) {
      return predicate()
        ? '*'
        : '**';
    }

    return w[rand(w.length)];
  }).join('/');
}

function getHandlers() {
  const count = rand(20, 1);

  return range(count).map(() => (predicate()
    ? asyncIncrementCount
    : incrementCount));
}


describe('#load-test', function() { // eslint-disable-line
  this.timeout(150 * 1000);

  beforeEach(() => {
    SE.reset();
    resetCount();
  });

  (N => it(`should be able to subscribe ${N} times on the same event`, async () => {
    for (let i = 0; i < N; i++) {
      SE.subscribe('/hello/world', incrementCount);
    }

    await SE.publish('/hello/world', 'test');
    expect(calls).to.be.eql(N);
  }))(100000);

  (N => it(`should be able to publish ${N} times`, () => {
    for (let i = 0; i < N; i++) {
      SE.publish(`/hello/world/${i}`, 'test');
    }
  }))(100000);

  (N => it(`should be able to publish ${N} times`, async () => {
    for (let i = 0; i < 2; i++) {
      SE.subscribe('/hello/world', incrementCount);
    }
    SE.subscribe('hello/*', incrementCount);
    SE.subscribe('hello/**', incrementCount);

    for (let i = 0; i < N; i++) {
      await SE.publish('hello/world', 'test');
    }

    expect(calls).to.be.eql(N * 3);
  }))(1000000);


  (N => it(`should be able to process ${N} publish pipelines simultaneously`, async () => {
    async function asyncFn() {
      await delay(10);
      incrementCount();
    }

    for (let i = 0; i < N; i++) {
      SE.subscribe(`/hello/world/${i}`, asyncFn);
    }

    const promises = [];
    for (let i = 0; i < N; i++) {
      promises.push(SE.publish(`/hello/world/${i}`, 'test'));
    }

    await Promise.all(promises);
    expect(calls).to.be.eql(N);
  }))(100000);

  ((N, M) => it(`should be able to subscribe ${M} times on each of ${N} different events`, async () => {
    for (let i = 0; i < M; i++) {
      await SE.publish(`/hello/world/${i}`, 'test');
    }

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        SE.subscribe(`/hello/world/${j}`, incrementCount);
      }
    }

    for (let i = 0; i < M; i++) {
      await SE.publish(`/hello/world/${i}`, 'test');
    }

    expect(calls).to.be.eql(N * M);
  }))(10000, 50);

  (N => it(`should be able to create a ${N} subscriptions chain and unsubscribe the same`, async () => {
    let subscription = SE.subscribe('/another/world/0', incrementCount);
    for (let i = 1; i < N; i++) {
      subscription = subscription.subscribe(`/another/world/${i}`, incrementCount);
    }

    for (let i = 0; i < N; i++) {
      await SE.publish(`/another/world/${i}`, 'test');
    }

    expect(calls).to.be.eql(N);
    expect(() => subscription.unsubscribe()).to.not.throw();
  }))(10000);

  (N => it(`should be able to subscribe ${N} times on the same glob event`, async () => {
    for (let i = 0; i < N; i++) {
      SE.subscribe('/hello/world/*/times', incrementCount);
    }

    await SE.publish('hello/world/1/times', 'test');
    expect(calls).to.be.eql(N);
  }))(100000);

  ((N, M, X) => it(`should be able to subscribe ${X} handlers pipeline, ${M} times each on ${N} different glob events`, async () => {
    for (let i = 0; i < N; i++) {
      await SE.publish(`hello/world/${i}/any/times`, 'test');
    }


    const handlers = [];
    for (let i = 0; i < X; i++) {
      handlers.push(incrementCount);
    }

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        SE.subscribe(`/hello/world/${i}/*/times`, ...handlers);
      }
    }

    const promises = [];
    for (let i = 0; i < N; i++) {
      promises.push(SE.publish(`hello/world/${i}/any/times`, 'test'));
    }
    await Promise.all(promises);

    expect(calls).to.be.eql(N * M * X);
  }))(1000, 50, 50);

  (N => it(`should be able to pass ${N} handlers for the pipeline`, async () => {
    const handlers = [];
    for (let i = 0; i < N; i++) {
      handlers.push(incrementCount);
    }

    SE.subscribe('/hello/world', ...handlers);

    await SE.publish('/hello/world', 'test');
    expect(calls).to.be.eql(N);
  }))(10000);

  (N => it(`should be able to pass ${N} middlewares to the instance`, async () => {
    const middlewares = [];
    for (let i = 0; i < N; i++) {
      middlewares.push(incrementCount);
    }

    SE.initialize(middlewares);

    await SE.publish('/hello/world', 'test');
    expect(calls).to.be.eql(N);
  }))(10000);


  (N => it(`should ensure there is no memory leakage.
        So subscribing ${1000 * 2} times and unsubscribing the same 
        and repeating this process for ${N} times 
        MUST NOT throw Out of Memory error`, async () => {
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(SE.publish(getEvent(), 'test'));
    }
    await Promise.all(promises);

    const progressBar = new cliProgress.SingleBar({ clearOnComplete: true }, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value of 200 and start value of 0
    progressBar.start(N, 0);

    for (let n = 0; n < N; n++) {
      const subscriptions = [];
      for (let i = 0; i < 1000; i++) {
        const subscription = SE.subscribe(getEvent(), ...getHandlers())
          .subscribe(getGlobEvent(), ...getHandlers());

        subscriptions.push(subscription);
      }

      for (let i = 0; i < subscriptions.length; i++) {
        subscriptions[i].unsubscribe();
      }

      // update the current value in your application..
      progressBar.update(n);
    }

    // stop the progress bar
    progressBar.stop();
  }))(5000);


  (() => it(`should push its limits for survival (real-world scenario) =>
      - LFU cache full
      - 1000 normal subscribe
      - 1000 glob subscribe
      - 1000 times 50 chained subscriptions
      - 1500 random events(pub, sub-n, sub-g)
      ALL AT THE SAME TIME ON THE SAME INSTANCE`, async () => {
    // For filling up the LFU cache
    for (let i = 0; i < 1000; i++) {
      await SE.publish(`hello/world/${i}/any/times`, 'test');
    }
    expect(calls).to.be.eql(0);


    for (let i = 0; i < 1000; i++) {
      SE.subscribe(getEvent(), ...getHandlers());
    }

    for (let i = 0; i < 1000; i++) {
      SE.subscribe(getGlobEvent(), ...getHandlers());
    }

    let promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(SE.publish(getEvent(), 'test'));
    }
    await Promise.all(promises);


    let subscriptions = [];
    for (let i = 0; i < 100; i++) {
      let subscription = SE.subscribe(getEvent(), ...getHandlers());

      for (let j = 0; j < 50; j++) {
        subscription = subscription.subscribe(getEvent(), ...getHandlers());
      }

      subscriptions.push(subscription);
    }


    const actions = {
      0() {
        SE.publish(getEvent(), 'test');
      },
      1() {
        SE.subscribe(getEvent(), ...getHandlers());
      },
      2() {
        SE.subscribe(getGlobEvent(), ...getHandlers());
      },
    };

    promises = [];
    for (let i = 0; i < 1500; i++) {
      const randAction = rand(3);
      actions[randAction] && promises.push(actions[randAction]());
    }
    await Promise.all(promises);

    for (let i = 0; i < subscriptions.length; i++) {
      subscriptions[i].unsubscribe();
    }

    SE.reset();

    subscriptions = [];
    for (let i = 0; i < 1000; i++) {
      subscriptions.push(SE.subscribe(getEvent(), ...getHandlers()));
      subscriptions.push(SE.subscribe(getGlobEvent(), ...getHandlers()));

      let subscription = SE.subscribe(getEvent(), ...getHandlers());
      for (let j = 0; j < 10; j++) {
        subscription = subscription.subscribe(getEvent(), ...getHandlers());
      }
      subscriptions.push(subscription);
    }

    for (let i = 0; i < subscriptions.length; i++) {
      subscriptions[i].unsubscribe();
    }
  }))();
});
