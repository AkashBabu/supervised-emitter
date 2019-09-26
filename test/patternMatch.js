import { expect } from 'chai';

import { doesPatternMatch } from '../src/patternMatch';

describe('#pattern-match', () => {
  it('should match plain string topics', () => {
    expect(doesPatternMatch('/asdf/asdf/asdf', '/asdf/asdf/asdf')).to.be.true;
  });

  it('should not consider starting and trailing "/" during match', () => {
    expect(doesPatternMatch('asdf/asdf/asdf', '/asdf/asdf/asdf')).to.be.true;
    expect(doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/asdf')).to.be.true;
    expect(doesPatternMatch('/asdf/asdf/asdf/', 'asdf/asdf/asdf')).to.be.true;
    expect(doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/asdf/')).to.be.true;
    expect(doesPatternMatch('/asdf/cat/ball', 'asdf/cat/ball/rat')).to.be.false;
    expect(doesPatternMatch('/asdf/cat/ball/rat', 'asdf/cat/ball')).to.be.false;
  });

  it('should match any string when "*" is specified for the given part of the topic', () => {
    expect(doesPatternMatch('/asdf/asdf/asdf', 'asdf/*/asdf/')).to.be.true;
    expect(doesPatternMatch('/asdf/asdf/asdf', '*/asdf/asdf/')).to.be.true;
    expect(doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/*')).to.be.true;
    expect(doesPatternMatch('cat/bat/rat', 'asdf/asdf/*')).to.be.false;
    expect(doesPatternMatch('cat/bat/rat', 'cat/bat/rat/*')).to.be.false;
    expect(doesPatternMatch('cat/bat/rat/asdf', 'cat/bat/rat/*')).to.be.true;

    expect(doesPatternMatch('cat/bat/rat/asdf', 'cat/*/rat/*')).to.be.true;
  });

  it('should match any number of parts if "**" is specified in the topic', () => {
    expect(doesPatternMatch('asdf/asdf/asdf/cat', 'asdf/**/cat')).to.be.true;
    expect(doesPatternMatch('asdf/asdf/asdf/cat', 'asdf/**/bat')).to.be.false;
    expect(doesPatternMatch('asdf/asdf/asdf', 'asdf/**/asdf')).to.be.true;
    expect(doesPatternMatch('asdf/asdf/asdf', 'asdf/**/asd')).to.be.false;
    expect(doesPatternMatch('asdf/cat/ball', 'asdf/**')).to.be.true;

    expect(doesPatternMatch('asdf/cat/ball', 'asdf/**/cat/ball')).to.be.true;
    expect(doesPatternMatch('asdf', 'asdf/**')).to.be.true;
    expect(doesPatternMatch('asdf/asdf', 'asdf/asdf/**/cat')).to.be.false;
    expect(doesPatternMatch('asdf/asdf', 'asdf/asdf/**/')).to.be.true;
  });

  it('should match the topic even when a mixin of "**" & "*" is present in the topic', () => {
    expect(doesPatternMatch('asdf/cat/ball/rat/mat/bun/lilly', 'asdf/**/rat/*/bun/lilly')).to.be.true;
  });

  it('should match the topic if pattern has "**" & more than one matching string has been found thereafter', () => {
    expect(doesPatternMatch('asdf/cat/ball/cat/mat/bun/lilly', 'asdf/**/cat/mat/*/lilly')).to.be.true;

    expect(doesPatternMatch('asdf/cat/ball/cat/mat/bun/lilly', 'asdf/**/cat/**/lilly')).to.be.true;
  });

  it('should throw an error if invalid pattern is given', () => {
    expect(() => doesPatternMatch('asdf/cat/ball', 'asdf/**/*')).to.throw;

    expect(() => doesPatternMatch('asdf/cat/ball', 'asdf/*/**')).to.throw;

    expect(() => doesPatternMatch('asdf/cat/ball', 'asdf/*/*')).not.to.throw;
  });
});
