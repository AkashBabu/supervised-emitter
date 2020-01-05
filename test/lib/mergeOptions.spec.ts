/* tslint:disable no-unused-expression */

import { expect } from 'chai';
import mergeOptions from '../../src/lib/mergeOptions';

describe('#mergeOptions', () => {
  it('should be able to merge two object', () => {
    const givenOpts = {
      foo: 1,
      bar: 2,
    };

    const defaultOpts = {
      baz: 3,
    };

    expect(mergeOptions(givenOpts, defaultOpts)).to.have.keys(['foo', 'bar', 'baz']);
  });

  it('should prioritize givenOpts over defaultOpts', () => {
    const givenOpts = {
      foo: 1,
      bar: 2,
    };

    const defaultOpts = {
      foo: 3,
    };

    expect(mergeOptions(givenOpts, defaultOpts)).to.have.keys(['foo', 'bar']);

    expect(mergeOptions(givenOpts, defaultOpts).foo).to.eql(1);
  });

  it('should be able to merge nested objects', () => {
    const givenOpts = {
      foo: 1,
      bar: 2,
      baz: {
        foo: 3,
      },
    };

    const defaultOpts = {
      baz: {
        foo: 4,
        daz: 5,
      },
    };

    expect(mergeOptions(givenOpts, defaultOpts)).to.have.keys(['foo', 'bar', 'baz']);

    expect(mergeOptions(givenOpts, defaultOpts).baz).to.have.keys(['foo', 'daz']);

    expect(mergeOptions(givenOpts, defaultOpts).baz.foo).to.eql(3);
    expect(mergeOptions(givenOpts, defaultOpts).baz.daz).to.eql(5);
  });
});
