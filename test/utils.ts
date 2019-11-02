import 'mocha';
import { expect } from 'chai';
import delay from 'delay';
import { pipe, compose } from '../src/utils';
import { IEnd } from '../src/supervisedEmitter';

const getCtx = () => ({
  data: null,
  pubEvent: 'foo/bar',
  subEvents: ['foo/bar'],
});

describe('#utils', () => {
  describe('compose()', () => {
    it('should compose all the given handlers', () => {
      let processedId = 0;

      compose(() => {
        expect(processedId).to.be.eql(2);
      }, () => {
        expect(processedId).to.be.eql(1);
        processedId = 2;
      }, () => {
        expect(processedId).to.be.eql(0);
        processedId = 1;
      })(getCtx());
    });

    it('should compose all async handlers', async () => {
      let processedId = 0;

      compose(() => {
        expect(processedId).to.be.eql(2);
      }, async () => {
        expect(processedId).to.be.eql(1);

        await new Promise(res => setTimeout(() => {
          processedId = 2;
          res();
        }, 10));
      }, async () => {
        expect(processedId).to.be.eql(0);

        await new Promise(res => setTimeout(() => {
          processedId = 1;
          res();
        }, 10));
      })(getCtx());
    });
  });

  describe('pipe()', () => {
    it('should pipe all the handlers', () => {
      let processedId = 0;

      pipe(() => {
        expect(processedId).to.be.eql(0);
        processedId = 1;
      }, () => {
        expect(processedId).to.be.eql(1);
        processedId = 2;
      }, () => {
        expect(processedId).to.be.eql(2);
      })(getCtx());
    });

    it('should pipe all async handlers', () => {
      let processedId = 0;

      pipe(async () => {
        expect(processedId).to.be.eql(0);

        await new Promise(res => setTimeout(() => {
          processedId = 1;
          res();
        }, 10));
      }, async () => {
        expect(processedId).to.be.eql(1);

        await new Promise(res => setTimeout(() => {
          processedId = 2;
          res();
        }, 10));
      }, () => {
        expect(processedId).to.be.eql(2);
      })(getCtx());
    });

    it('should pass on the results returned by intermediate handler to next handler', () => {
      pipe(({ data }) => {
        expect(data).to.be.null;

        return 1;
      }, ({ data }) => {
        expect(data).to.be.eql(1);

        return 2;
      }, ({ data }) => {
        expect(data).to.be.eql(2);
      })(getCtx());
    });

    it('should pass the second or the further args as is without any modifications to all the handlers', () => {
      pipe(async ({ data }, ev) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.null;

        // to simulate async nature
        await delay(10);

        return 1;
      }, ({ data }, ev) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.eql(1);

        return 2;
      }, ({ data }, ev) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.eql(2);
      })(getCtx(), 'test');
    });

    it('should be able to stop the pipeline flow when "end()" is called', async () => {
      let calls = 0;
      const data = await pipe(() => {
        calls++;
      }, ({ end }) => {
        calls++;
        return (end as IEnd)('test');
      }, () => {
        calls++;
      })(getCtx());

      expect(calls).to.be.eql(2);
      expect(data).to.be.eql('test');
    });
  });
});
