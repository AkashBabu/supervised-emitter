import {expect} from 'chai';

import delay from 'delay';
import ThreadRunner from '../src/threadRunner';

describe('#thread-runner', () => {
  it('should be awaitable', async () => {
    async function worker(task: any) {
      await delay(10);
      return task;
    }

    const threadRunner = ThreadRunner(worker, {maxRunners: 2});

    const [[, item1], [, item2], [, item3]] = await Promise.all([
      threadRunner('item1'),
      threadRunner('item2'),
      threadRunner('item3'),
    ]);

    expect(item1).to.be.eql('item1');
    expect(item2).to.be.eql('item2');
    expect(item3).to.be.eql('item3');

    const [, item4] = await threadRunner('item4');
    expect(item4).to.be.eql('item4');
  });

  it('should only forward the error and NOT throw it when one is encountered', async () => {
    async function worker() {
      await delay(10);

      throw new Error('Failed');
    }

    const threadRunner = ThreadRunner(worker, {maxRunners: 2});

    const [err] = await threadRunner('item1');
    expect(err).to.exist;
  });

  it('should run atmost the given number of promises at any given instance of time', async () => {
    let running = 0;
    async function worker(task: any) {
      running++;
      await delay(20 + Math.random() * 100);
      running--;

      return task;
    }

    const MAX_RUNNERS = 10;
    const threadRunner = ThreadRunner(worker, {maxRunners: MAX_RUNNERS});

    setInterval(() => {
      expect(running <= MAX_RUNNERS).to.be.true;
    }, 10);

    const result = await Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map((_, i) => threadRunner(`item${i}`)));

    result.forEach(([, item], i) => {
      expect(item).to.be.eql(`item${i}`);
    });
  });

  it('should assume a default maxRunners=10', async () => {
    let running = 0;
    async function worker(task: any) {
      running++;
      await delay(20 + Math.random() * 100);
      running--;

      return task;
    }

    const MAX_RUNNERS = 10;
    const threadRunner = ThreadRunner(worker);

    setInterval(() => {
      expect(running <= MAX_RUNNERS).to.be.true;
    }, 10);

    const result = await Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map((_, i) => threadRunner(`item${i}`)));

    result.forEach(([, item], i) => {
      expect(item).to.be.eql(`item${i}`);
    });
  });

  it('should run atmost the given number of promises even when a few tasks throw error', async () => {
    let running = 0;
    async function worker(task: any) {
      running++;
      await delay(20 + Math.random() * 100);
      running--;

      const err = !!Math.round(Math.random());
      if (err) {
        throw new Error('Failed');
      }

      return task;
    }

    const MAX_RUNNERS = 10;
    const threadRunner = ThreadRunner(worker, {maxRunners: MAX_RUNNERS});

    setInterval(() => {
      expect(running <= MAX_RUNNERS).to.be.true;
    }, 10);

    const result = await Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map(async (_, i) => {
      try {
        const res = await threadRunner(`item${i}`);
        return res;
      } catch (error) {
        return error;
      }
    }));

    result.forEach(([err, item], i) => {
      if (!err) {
        expect(item).to.be.eql(`item${i}`);
      }
    });
  });

});
