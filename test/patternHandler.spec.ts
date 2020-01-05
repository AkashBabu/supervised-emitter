import { expect } from 'chai';

import SupervisedEmitter from '../src/supervisedEmitter';

const { patternHandler } = SupervisedEmitter;

describe('#patternHandler', () => {
  it('should return a middleware which listens only to the given pattern', async () => {
    let calls = 0;

    const SE = new SupervisedEmitter([
      patternHandler('hello/**', () => {
        calls++;
        return null;
      }),
    ]);

    await SE.publish('hello/world', 'test');
    await SE.publish('fun/world', 'test');

    expect(calls).to.be.eql(1);
  });

  it('should return a middleware which listens only to the given topic', async () => {
    let calls = 0;

    const SE = new SupervisedEmitter([
      patternHandler('hello/world', () => {
        calls++;
        return null;
      }),
    ]);

    await SE.publish('hello/world', 'test');
    await SE.publish('fun/world', 'test');

    expect(calls).to.be.eql(1);
  });

  it('should pass through the data if the pattern doesnt match with the pubEvent', async () => {
    const calls = [0, 0];

    const SE = new SupervisedEmitter([
      patternHandler('hello/**', ({ data }) => {
        calls[0]++;
        return data;
      }),
      ({ data }) => {
        calls[1]++;

        expect(data).to.be.eql('test');
      },
    ]);

    await SE.publish('hello/world', 'test');
    await SE.publish('fun/world', 'test');

    expect(calls[0]).to.be.eql(1);
    expect(calls[1]).to.be.eql(2);
  });
});
