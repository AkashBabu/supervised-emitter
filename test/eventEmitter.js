import { expect } from 'chai';
import delay from 'delay';

import SE from '../src';

describe('#supervised-emitter', () => {
  beforeEach(() => SE.reset());

  it('should be a singleton', () => {
    SE.initialize();
    expect(() => SE.initialize()).to.throw;
  });

  it('should be able to subscribe to events / topics', done => {
    const test = 'testing';

    SE.subscribe('test', ({ data }) => {
      expect(data).to.be.eql(test);
      done();
    });

    SE.publish('test', test);
  });

  it('should be able to publish data to subscribers', done => {
    const test = 'testing';

    let receivedDataCount = 0;

    SE.subscribe('test', ({ data }) => {
      receivedDataCount++;

      expect(data).to.be.eql(test);

      if (receivedDataCount === 2) done();
    });

    SE.subscribe('test', ({ data }) => {
      receivedDataCount++;

      expect(data).to.be.eql(test);

      if (receivedDataCount === 2) done();
    });

    SE.publish('test', test);
  });

  it('should pipe handlers when more than one handler is present', done => {
    const test = 0;

    SE.subscribe('test', ({ data }) => {
      expect(data).to.be.eql(test);
      return data + 1;
    }, ({ data }) => {
      expect(data).to.be.eql(test + 1);
      done();
    });

    SE.publish('test', test);
  });

  it('should be able to unsubscribe from topics', async () => {
    const test = 'testing';

    let calls = 0;

    const subscription = SE.subscribe('test', ({ data }) => {
      calls++;

      expect(data).to.be.eql(test);
    });

    SE.publish('test', test);
    await delay(10);
    subscription.unsubscribe();

    SE.publish('test', test);
    await delay(10);
    expect(calls).to.be.eql(1);
  });

  it('should be able to publish / subscribe to topics with glob patterns', async () => {
    const test = 'testing';

    let calls = 0;
    let subscription = SE.subscribe('test/**', ({ data }) => {
      calls++;
      expect(data).to.be.eql(test);
    });

    SE.publish('test', test);
    await delay(10);
    expect(calls).to.be.eql(1);

    subscription.unsubscribe();

    subscription = SE.subscribe('hello/*/world', ({ data }) => {
      calls++;
      expect(data).to.be.eql(test);
    });

    SE.publish('hello/my/world', test);
    await delay(10);
    expect(calls).to.be.eql(2);
  });

  it('should allow to publish an event when one is already being processed', async () => {
    const test = 'testing';

    let processing = 0;
    SE.subscribe('test1', async ({ data }) => {
      processing++;
      await delay(50);

      expect(data).to.be.eql(test);
      processing--;
    });

    SE.subscribe('test2', async ({ data }) => {
      processing++;

      await delay(50);

      expect(data).to.be.eql(test);
      processing--;
    });

    SE.publish('test1', test);
    await delay(10);
    expect(processing).to.be.eql(1);

    SE.publish('test2', test);
    await delay(10);
    expect(processing).to.be.eql(2);

    await delay(100);
    expect(processing).to.be.eql(0);
  });

  it('should support async subscribers and the piped handlers must be executed in the sequence of pipe', async () => {
    const orderOfExecution = [];

    const test = 0;
    SE.subscribe('test', async ({ data }) => {
      orderOfExecution.push(0);

      await delay(10);

      expect(data).to.be.eql(0);

      return data + 1;
    }, ({ data }) => {
      orderOfExecution.push(1);

      expect(data).to.be.eql(1);
      return data + 1;
    }, ({ data }) => {
      orderOfExecution.push(2);

      expect(data).to.be.eql(2);
    });

    SE.publish('test', test);

    await delay(50);
    orderOfExecution.forEach((item, i) => {
      expect(item).to.be.eql(i);
    });
  });

  it('must not affect the ctx in other pipelines if changed in one pipline', async () => {
    const test = 0;

    let calls = 0;
    let processing = 0;
    SE.subscribe('test', async ctx => {
      calls++;
      expect(processing).to.be.eql(0);

      processing++;
      expect(ctx.data).to.be.eql(test);
      ctx.data += 10;

      await delay(20);
      processing--;
      return ctx.data;
    }, ({ data }) => {
      calls++;
      processing++;
      expect(data).to.be.eql(test + 10);
      processing--;
    });

    SE.subscribe('test', async ctx => {
      calls++;
      expect(processing).to.be.eql(1);

      processing++;
      await delay(10);

      expect(ctx.data).to.be.eql(test);
      processing--;
      expect(processing).to.be.eql(1);
    });

    SE.publish('test', test);

    await delay(50);
    expect(calls).to.be.eql(3);
  });

  it('should support w/o async middlewares', async () => {
    let calls = 0;

    SE.initialize([
      async ({ data, pubEvent }) => {
        calls++;
        expect(pubEvent).to.be.eql('test');

        await delay(10);
        return data + 10;
      },
      async ({ data, pubEvent }) => {
        calls++;
        expect(pubEvent).to.be.eql('test');
        expect(data).to.be.eql(10);

        await delay(10);
        return data + 5;
      },
      ({ data, pubEvent }) => {
        calls++;
        expect(pubEvent).to.be.eql('test');
        expect(data).to.be.eql(15);

        return data + 100;
      },
    ]);

    SE.subscribe('test', ({ data }) => {
      calls++;
      expect(data).to.be.eql(115);
    });

    SE.publish('test', 0);

    await delay(50);
    expect(calls).to.be.eql(4);
  });

  it('should allow modifications for ctx to be passed through the pipeline', async () => {
    const test = 'testing';

    let calls = 0;

    SE.subscribe('test', ctx => {
      calls++;

      ctx.newProp = 'newProp';

      return ctx.data;
    }, ({ data, newProp }) => {
      calls++;

      expect(newProp).to.be.eql('newProp');
      expect(data).to.be.eql(test);
    });

    SE.publish('test', test);

    await delay(10);

    expect(calls).to.be.eql(2);
  });

  it('should allow chaining multiple subscriptions and return an unsubscribe object that unsubsribes from all the chained subscriptions', async () => {
    let calls = 0;
    const subscription = SE.subscribe('/asdf/asdf/asdf', ({ data }) => {
      calls++;
      expect(data).to.be.eql('asdf');
    })
    .subscribe('/hello/world', ({ data }) => {
      calls++;
      expect(data).to.be.eql('hello-world');
    })
    .subscribe('/cat/*/rat', ({ data }) => {
      calls++;
      expect(data).to.be.eql('glob');
    });

    SE.publish('/asdf/asdf/asdf', 'asdf');
    SE.publish('/hello/world', 'hello-world');
    SE.publish('/cat/bat/rat', 'glob');
    await delay(10);
    expect(calls).to.be.eql(3);

    subscription.unsubscribe();

    SE.publish('/asdf/asdf/asdf', 'asdf');
    SE.publish('/hello/world', 'hello-world');
    SE.publish('/cat/bat/rat', 'glob');
    await delay(10);
    expect(calls).to.be.eql(3);
  });

  // it('should allow middlewares to stop / block the flow of events in the system');

  // it('should allow middlewares to continue running statements after await next()');

  // it('should log useful debugging messages like No Subscribers found for the event or the like when NODE_ENV != \'production\'');
});
