import { expect } from 'chai';
import delay from 'delay';

import SupervisedEmitter from '../src/supervisedEmitter';
import {IContext} from '../src/interfaces';

const {patternHandler, InternalEvents} = SupervisedEmitter;

describe('#supervised-emitter (SE)', () => {

  it(`should include the following in the context(ctx) to the pipelines:
      - data
      - pubEvent (published event)
      - subEvents (matching subscribers events)`, async () => {
    let calls = 0;

    function testCtx(ctx: IContext) {
      const {
        data, pubEvent, subEvents,
      } = ctx;

      calls++;

      expect(data).to.be.eql('test');
      expect(pubEvent).to.be.eql('hello/se/world');
      expect(subEvents).to.have.members(['hello/se/world', 'hello/*/world']);

      return data;
    }

    const SE = new SupervisedEmitter([testCtx]);

    SE
      .subscribe('/hello/se/world', testCtx)
      .subscribe('/hello/*/world', testCtx);

    await SE.publish('/hello/se/world', 'test');

    await delay(10);

    expect(calls).to.be.eql(3);
  });

  it('should support publish and subscribe even w/o any middlewares', async () => {
    let calls = 0;
    const SE = new SupervisedEmitter();

    SE.subscribe('foo/bar', () => calls++);

    await SE.publish('/foo/bar/', 'hello');

    expect(calls).to.be.eql(1);
  });

  it('should ignore leading and trailing seperators (/)', async () => {
    let calls = 0;
    const SE = new SupervisedEmitter();

    SE.subscribe('foo/bar', () => calls++);

    await SE.publish('/foo/bar/', 'hello');

    expect(calls).to.be.eql(1);
  });

  it('must not consider empty parts in the event', async () => {
    let calls = 0;
    const SE = new SupervisedEmitter();

    SE.subscribe('foo//bar', () => calls++);

    await SE.publish('/foo/bar/', 'hello');

    expect(calls).to.be.eql(1);
  });

  it('should pass any modifications to the context in the middlewares to all the subscription pipelines', async () => {
    let calls = 0;

    function newMethod() { }

    const SE = new SupervisedEmitter([
      (ctx) => {
        ctx.newMethod = newMethod;
        ctx.newProperty = 'helloworld';

        return ctx.data;
      },
    ]);

    SE.subscribe('foo/bar', (ctx) => {
      calls++;

      expect(ctx.newMethod).to.be.eql(newMethod);
      expect(ctx.newProperty).to.be.eql('helloworld');
    });

    SE.subscribe('foo/*', (ctx) => {
      calls++;

      expect(ctx.newMethod).to.be.eql(newMethod);
      expect(ctx.newProperty).to.be.eql('helloworld');
    });

    await SE.publish('foo/bar', 'test');

    expect(calls).to.be.eql(2);
  });

  describe('.subscribe()', () => {
    it('should be able to subscribe to events / topics', done => {
      const test = 'testing';
      const SE = new SupervisedEmitter();

      SE.subscribe('foo/', ({ data }) => {
        expect(data).to.be.eql(test);
        done();
      });

      SE.publish('/foo/', test);
    });

    it('should ensure correct functionality', async () => {
      const SE = new SupervisedEmitter();

      const calls = [0, 0, 0];

      SE.subscribe('foo/', ({ data }) => {
        calls[0]++;
        expect(data).to.be.eql('foo');
      });

      SE.subscribe('bar/', ({ data }) => {
        calls[1]++;
        expect(data).to.be.eql('bar');
      })
      .subscribe('baz/', ({ data }) => {
        calls[2]++;
        expect(data).to.be.eql('baz');
      });

      await SE.publish('/foo/', 'foo');
      await SE.publish('/bar/', 'bar');
      await SE.publish('/baz', 'baz');

      expect(calls[0]).to.be.eql(1);
      expect(calls[1]).to.be.eql(1);
      expect(calls[2]).to.be.eql(1);
    });

    it('should pipe handlers when more than one handler is present', done => {
      const test = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/foo/bar', ({ data }) => {
        expect(data).to.be.eql(test);
        return data + 1;
      }, ({ data }) => {
        expect(data).to.be.eql(test + 1);
        done();
      });

      SE.publish('/foo/bar', test);
    });

    it('should be able to publish / subscribe to topics with glob patterns', async () => {
      const test = 'testing';

      let calls = 0;
      const SE = new SupervisedEmitter();

      let subscription = SE.subscribe('foo/**', ({ data }) => {
        calls++;
        expect(data).to.be.eql(test);
      });

      await SE.publish('foo/bar', test);
      expect(calls).to.be.eql(1);

      subscription.unsubscribe();

      subscription = SE.subscribe('hello/*/world', ({ data }) => {
        calls++;
        expect(data).to.be.eql(test);
      });

      await SE.publish('hello/my/world', test);
      expect(calls).to.be.eql(2);
    });

    it('should support async subscribers and the piped handlers must be executed in the sequence of pipe', async () => {
      const orderOfExecution: number[] = [];

      const test = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/foo/bar', async ({ data }) => {
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

      SE.publish('/foo/bar', test);

      await delay(50);
      orderOfExecution.forEach((item, i) => {
        expect(item).to.be.eql(i);
      });
    });

    it('must not affect the ctx in other pipelines if changed in one pipline', async () => {
      const test = 0;

      let calls = 0;
      let processing = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/foo/bar', async ctx => {
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

      SE.subscribe('/foo/bar', async ctx => {
        calls++;
        expect(processing).to.be.eql(1);

        processing++;
        await delay(10);

        expect(ctx.data).to.be.eql(test);
        processing--;
        expect(processing).to.be.eql(1);
      });

      SE.publish('/foo/bar', test);

      await delay(50);
      expect(calls).to.be.eql(3);
    });

    it('should allow modifications for ctx to be passed through the pipeline', async () => {
      const test = 'testing';

      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/foo/bar', ctx => {
        calls++;

        ctx.newProp = 'newProp';

        return ctx.data;
      }, ({ data, newProp }) => {
        calls++;

        expect(newProp).to.be.eql('newProp');
        expect(data).to.be.eql(test);
      });

      SE.publish('/foo/bar', test);

      await delay(10);

      expect(calls).to.be.eql(2);
    });

    it(`should allow chaining multiple subscriptions and return an unsubscribe
          object that unsubsribes from all the chained subscriptions`, async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      const subscription = SE.subscribe('/another/world', ({ data }) => {
        calls++;
        expect(data).to.be.eql('ping');
      })
        .subscribe('/hello/world', ({ data }) => {
          calls++;
          expect(data).to.be.eql('hello-world');
        })
        .subscribe('/cat/*/rat', ({ data }) => {
          calls++;
          expect(data).to.be.eql('glob');
        });

      SE.publish('another/world', 'ping');
      SE.publish('/hello/world', 'hello-world');
      SE.publish('/cat/bat/rat', 'glob');
      await delay(10);
      expect(calls).to.be.eql(3);

      subscription.unsubscribe();

      calls = 0;
      SE.publish('another/world', 'ping');
      SE.publish('/hello/world', 'hello-world');
      SE.publish('/cat/bat/rat', 'glob');
      await delay(10);
      expect(calls).to.be.eql(0);
    });

    it('should allow any handler to stop the flow of data in the pipeline', async () => {
      let calls = 0;
      let completed = false;
      const SE = new SupervisedEmitter();

      SE
        .subscribe('/hello/world',
          async ({ data }) => {
            calls++;
            expect(data).to.be.eql(0);

            await delay(10);
            return 1;
          },
          async ({ data }) => {
            calls++;
            expect(data).to.be.eql(1);

            await delay(10);

            SE.publish('completed', 2);
            return;
          },
          ({ data }) => {
            calls++;
            expect(data).to.be.eql(2);

            return 3;
          })
        .subscribe('completed', ({ data }) => {
          expect(data).to.be.eql(2);
          completed = true;
        });

      SE.publish('/hello/world', 0);
      await delay(50);

      expect(completed).to.be.true;
      expect(calls).to.be.eql(2);
    });
  });

  describe('.subscribeOnce()', () => {
    it('should listen to just the first event', async () => {
      const SE = new SupervisedEmitter();

      let calls = 0;
      SE.subscribeOnce('foo/bar', () => {
        calls++;
      });

      await SE.publish('foo/bar', 'test');
      await SE.publish('foo/bar', 'test');

      expect(calls).to.be.equals(1);
    });

    it('should resolve/reject if an event has been received', async () => {
      const SE = new SupervisedEmitter();

      const seq: number[] = [];
      (async () => {
        const data = await SE.subscribeOnce('foo/bar', ({data}) => {
          seq.push(0);

          return data;
        });

        seq.push(1);

        expect(data).to.be.eql('blah');
      })();

      await SE.publish('foo/bar', 'blah');
      await SE.publish('foo/bar', 'blah');

      seq.forEach((el, i) => {
        expect(el).to.be.eq(i);
      });
    });
  });

  describe('.waitTill()', () => {
    it('should wait till the required event is received', async () => {
      const SE = new SupervisedEmitter();

      const seq: number[] = [];
      (async () => {
        const data = await SE.waitTill('foo/bar');
        seq.push(0);

        expect(data).to.be.eql('blah');
      })();

      await new Promise(res => setTimeout(res, 10));
      await SE.publish('foo/bar', 'blah');

      seq.forEach((el, i) => {
        expect(el).to.be.eq(i);
      });
    });
  });

  describe('.publish()', () => {
    it('should be able to publish data to subscribers', done => {
      const test = 'testing';

      let receivedDataCount = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('foo/bar', ({ data }) => {
        receivedDataCount++;

        expect(data).to.be.eql(test);

        if (receivedDataCount === 2) done();
      });

      SE.subscribe('foo/bar', ({ data }) => {
        receivedDataCount++;

        expect(data).to.be.eql(test);

        if (receivedDataCount === 2) done();
      });

      SE.publish('foo/bar', test);
    });

    it('should allow to publish an event when one is already being processed', async () => {
      const test = 'testing';

      let processing = 0;
      const SE = new SupervisedEmitter();

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

    it('should publish events to normal event subscribers after a publish event has already occured', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/hello/*/world', ({ data }) => {
        calls++;
        expect(data).to.be.eql('test');
      });

      SE.publish('/hello/se/world', 'test');

      await delay(10);
      expect(calls).to.be.eql(1);

      calls = 0;

      SE.subscribe('/hello/se/world', () => {
        calls++;
      });

      SE.publish('/hello/se/world', 'test');

      await delay(10);

      expect(calls).to.be.eql(2);
    });

    it('should publish events to pattern event after a publish event has already occured', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/hello/se/world', () => {
        calls++;
      });

      SE.publish('/hello/se/world', 'test');

      await delay(10);
      expect(calls).to.be.eql(1);

      calls = 0;

      SE.subscribe('/hello/*/world', ({ data }) => {
        calls++;
        expect(data).to.be.eql('test');
      });

      SE.publish('/hello/se/world', 'test');

      await delay(10);

      expect(calls).to.be.eql(2);
    });

    it('should be possible to await on publish events', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter([
        async ({ data }) => {
          await delay(10);
          calls++;
          expect(data).to.be.eql('test');

          return data;
        },
      ]);

      SE.subscribe('/hello/se/world', async ({ data }) => {
        await delay(10);
        calls++;
        expect(data).to.be.eql('test');
        return data;
      }, async ({ data }) => {
        await delay(10);
        calls++;
        expect(data).to.be.eql('test');
      });

      SE.subscribe('/hello/*/world', async ({ data }) => {
        await delay(10);
        calls++;
        expect(data).to.be.eql('test');
        return data;
      }, async ({ data }) => {
        await delay(10);
        calls++;
        expect(data).to.be.eql('test');
      });

      await SE.publish('/hello/se/world', 'test');

      expect(calls).to.be.eql(5);
    });

    it('should gracefully handle errors in publish pipeline', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('foo/bar',
        ({ data }) => {
          calls++;
          return data;
        },
        () => {
          calls++;
          throw new Error('Failed');
        },
      );

      SE.subscribe('foo/bar', ({ data }) => {
        calls++;
        return data;
      }, async () => {
        calls++;
        await delay(10);
        throw new Error('failed');
      });

      await SE.publish('foo/bar', 'test');

      expect(calls).to.be.eql(4);
    });

    it('should be able to publish empty|undefined data', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('foo/bar',
        ({ data }) => {
          calls++;
          expect(data).to.be.null;
        },
      );

      await SE.publish('foo/bar');

      expect(calls).to.be.eql(1);
    });
  });

  describe('.unsubscribe()', () => {
    it('should be able to unsubscribe from topics', async () => {
      const test = 'testing';

      let calls = 0;
      const SE = new SupervisedEmitter();

      const subscription = SE.subscribe('foo/bar', ({ data }) => {
        calls++;

        expect(data).to.be.eql(test);
      });

      SE.publish('foo/bar', test);
      await delay(10);
      subscription.unsubscribe();

      SE.publish('foo/bar', test);
      await delay(10);
      expect(calls).to.be.eql(1);
    });

    it('should allow subscription to be unsubscribed multiple times', async () => {
      const SE = new SupervisedEmitter();

      const subscription = SE.subscribe('/hello/se/world', () => { });

      subscription.unsubscribe();
      expect(() => subscription.unsubscribe()).to.not.throw;
    });
  });

  describe('.scope()', () => {
    it('should be able to emit scoped events', async () => {
      let calls = 0;
      const SE = new SupervisedEmitter();

      SE.subscribe('/hello/world', () => {
        expect(false).to.be.true;
      });

      const scope = SE.getScope();
      SE.subscribe(scope('/hello/world'), ({ data }) => {
        calls++;

        expect(data).to.be.eql('testing');
      });

      SE.publish(scope('/hello/world'), 'testing');

      await delay(10);

      expect(calls).to.be.eql(1);
    });
  });

  describe('.unScope()', () => {
    it('should match the topic when unscoped', () => {
      const SE = new SupervisedEmitter();

      const scope = SE.getScope();

      const topic = '/hello/world';
      const scopedTopic = scope('/hello/world');

      expect(SE.unScope(scopedTopic)).to.be.eql(topic);
      expect(SE.unScope(topic)).to.be.eql(topic);
    });
  });

  describe('#life-cycle events', () => {
    it('should not publish lifecycle events by default', async () => {
      let calls = 0;

      const SE = new SupervisedEmitter([
        ({data}) => {
          calls++;
          return data;
        },
      ]);

      SE.subscribe('foo/bar', () => {});

      expect(calls).to.be.eql(0);
    });

    it('should not publish lifeCycle events when subscribed to lifeCycle events', async () => {
      let calls = 0;

      const SE = new SupervisedEmitter([
        patternHandler(InternalEvents.ON_INIT, ({data}) => {
          calls++;
          return data;
        }),
      ], {
        lifeCycleEvents: true,
      });

      SE.subscribe(InternalEvents.ON_SUBSCRIBE, ({data}) => {
        return data;
      });

      SE.subscribe(InternalEvents.ON_UNSUBSCRIBE, ({data}) => {
        return data;
      });

      // internal publishes are also async,
      // hence this delay would ensure they
      // are resolved before checking `calls`
      await delay(10);

      expect(calls).to.be.eql(1); // this is because of on_init event
    });

    it('should publish life-cycle events when `lifeCycleEvents` is set to true', async () => {
      let initCalled = false;
      let onSubscribeCalled = false;
      let onUnsubscribeCalled = false;

      const SE = new SupervisedEmitter([
        patternHandler(InternalEvents.ON_INIT, ({data}) => {
          initCalled = true;
          return data;
        }),
      ], {
        lifeCycleEvents: true,
      });

      SE.subscribe(InternalEvents.ON_SUBSCRIBE, ({data}) => {
        onSubscribeCalled = true;
        return data;
      });

      SE.subscribe(InternalEvents.ON_UNSUBSCRIBE, ({data}) => {
        onUnsubscribeCalled = true;
        return data;
      });

      const subscription = SE.subscribe('foo/bar', () => { });

      subscription.unsubscribe();

      await delay(10);

      expect(initCalled).to.be.true;
      expect(onSubscribeCalled).to.be.true;
      expect(onUnsubscribeCalled).to.be.true;
    });

    it(`should publish ON_EVENT life-cycle event when an error occurs during
          publish cycle (in subscription pipeline or elsewhere)`, async () => {
      let calls = 0;

      const SE = new SupervisedEmitter([], {
        lifeCycleEvents: true,
      });

      SE.subscribe('foo/bar', () => {throw new Error('Failed'); });

      SE.subscribe(InternalEvents.ON_ERROR, ({data: {error}}) => {
        calls++;
        expect(error).to.be.an.instanceof(Error);
      });

      await SE.publish('foo/bar');

      expect(calls).to.be.eql(1);
    });

  });
});
