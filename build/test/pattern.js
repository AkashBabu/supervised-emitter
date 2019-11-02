"use strict";
/* tslint:disable no-unused-expression */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const pattern_1 = require("../src/pattern");
describe('#pattern', () => {
    describe('#doesPatternMatch()', () => {
        it('should match plain string topics', () => {
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', '/asdf/asdf/asdf')).to.be.true;
        });
        it('should not consider starting and trailing "/" during match', () => {
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf/asdf', '/asdf/asdf/asdf')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/asdf')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf/', 'asdf/asdf/asdf')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/asdf/')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/cat/ball', 'asdf/cat/ball/rat')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/cat/ball/rat', 'asdf/cat/ball')).to.be.false;
        });
        it('should match any string when "*" is specified for the given part of the topic', () => {
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', 'asdf/*/asdf/')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', '*/asdf/asdf/')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('/asdf/asdf/asdf', 'asdf/asdf/*')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('cat/bat/rat', 'asdf/asdf/*')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('cat/bat/rat', 'cat/bat/rat/*')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('cat/bat/rat/asdf', 'cat/bat/rat/*')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('cat/bat/rat/asdf', 'cat/*/rat/*')).to.be.true;
        });
        it('should match any number of parts if "**" is specified in the topic', () => {
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf/asdf/cat', 'asdf/**/cat')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf/asdf/cat', 'asdf/**/bat')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf/asdf', 'asdf/**/asdf')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf/asdf', 'asdf/**/asd')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/cat/ball', 'asdf/**')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/cat/ball', 'asdf/**/cat/ball')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf', 'asdf/**')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf', 'asdf/asdf/**/cat')).to.be.false;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/asdf', 'asdf/asdf/**/')).to.be.true;
        });
        it('should match the topic even when a mixin of "**" & "*" is present in the topic', () => {
            chai_1.expect(pattern_1.doesPatternMatch('asdf/cat/ball/rat/mat/bun/lilly', 'asdf/**/rat/*/bun/lilly')).to.be.true;
        });
        it('should match the topic if pattern has "**" & more than one matching string has been found thereafter', () => {
            chai_1.expect(pattern_1.doesPatternMatch('asdf/cat/ball/cat/mat/bun/lilly', 'asdf/**/cat/mat/*/lilly')).to.be.true;
            chai_1.expect(pattern_1.doesPatternMatch('asdf/cat/ball/cat/mat/bun/lilly', 'asdf/**/cat/**/lilly')).to.be.true;
        });
        it('should throw an error if invalid pattern is given', () => {
            chai_1.expect(() => pattern_1.doesPatternMatch('asdf/cat/ball', 'asdf/**/*')).to.throw('DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/');
            chai_1.expect(() => pattern_1.doesPatternMatch('asdf/cat/ball', 'asdf/*/**')).to.throw('DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/');
            chai_1.expect(() => pattern_1.doesPatternMatch('asdf/cat/ball', 'asdf/*/*')).not.to.throw('DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/');
        });
    });
    describe('#sanitizeEvent()', () => {
        it('should remove empty parts', () => {
            chai_1.expect(pattern_1.sanitizeEvent('/foo/bar//baz///ball/')).to.be.eql('foo/bar/baz/ball');
            chai_1.expect(pattern_1.sanitizeEvent('/foo/bar/baz/ball/')).to.be.eql('foo/bar/baz/ball');
            chai_1.expect(pattern_1.sanitizeEvent('foo/bar/baz/ball/')).to.be.eql('foo/bar/baz/ball');
            chai_1.expect(pattern_1.sanitizeEvent('foo/bar/baz/ball')).to.be.eql('foo/bar/baz/ball');
        });
        it('should return non-empty parts if getParts == true', () => {
            chai_1.expect(pattern_1.sanitizeEvent('/foo/bar//baz///ball/', true)).to.eql(['foo', 'bar', 'baz', 'ball']);
            chai_1.expect(pattern_1.sanitizeEvent('/foo/bar/baz/ball/', true)).to.eql(['foo', 'bar', 'baz', 'ball']);
            chai_1.expect(pattern_1.sanitizeEvent('foo/bar/baz/ball', true)).to.eql(['foo', 'bar', 'baz', 'ball']);
        });
    });
});
//# sourceMappingURL=pattern.js.map