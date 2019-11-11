import 'mocha';
import { expect } from 'chai';
import delay from 'delay';
import { pipe, getKeys } from '../src/utils';
import { IContext } from '../src/interfaces';

const getCtx = () => ({
  data: null,
  pubEvent: 'foo/bar',
  subEvents: ['foo/bar'],
});

describe('#utils', () => {
  // describe('compose()', () => {
  //   it('should compose all the given handlers', () => {
  //     let processedId = 0;

  //     compose(() => {
  //       expect(processedId).to.be.eql(2);
  //     }, () => {
  //       expect(processedId).to.be.eql(1);
  //       processedId = 2;
  //     }, () => {
  //       expect(processedId).to.be.eql(0);
  //       processedId = 1;
  //     })(getCtx());
  //   });

  //   it('should compose all async handlers', async () => {
  //     let processedId = 0;

  //     compose(() => {
  //       expect(processedId).to.be.eql(2);
  //     }, async () => {
  //       expect(processedId).to.be.eql(1);

  //       await new Promise(res => setTimeout(() => {
  //         processedId = 2;
  //         res();
  //       }, 10));
  //     }, async () => {
  //       expect(processedId).to.be.eql(0);

  //       await new Promise(res => setTimeout(() => {
  //         processedId = 1;
  //         res();
  //       }, 10));
  //     })(getCtx());
  //   });
  // });

  describe('pipe()', () => {
    it('should pipe all the handlers', () => {
      let processedId = 0;

      pipe(() => {
        expect(processedId).to.be.eql(0);
        processedId = 1;
        return null;
      }, () => {
        expect(processedId).to.be.eql(1);
        processedId = 2;
        return null;
      }, () => {
        expect(processedId).to.be.eql(2);
        return null;
      })(getCtx());
    });

    it('should pipe all async handlers', () => {
      let processedId = 0;

      pipe(() => {
        expect(processedId).to.be.eql(0);

        return new Promise(res => setTimeout(() => {
          processedId = 1;
          res(null);
        }, 10));
      }, () => {
        expect(processedId).to.be.eql(1);

        return new Promise(res => setTimeout(() => {
          processedId = 2;
          res(null);
        }, 10));
      }, () => {
        expect(processedId).to.be.eql(2);
      })(getCtx());
    });

    it('should pass on the results returned by intermediate handler to next handler', () => {
      pipe(({ data }: IContext) => {
        expect(data).to.be.null;

        return 1;
      }, ({ data }: IContext) => {
        expect(data).to.be.eql(1);

        return 2;
      }, ({ data }: IContext) => {
        expect(data).to.be.eql(2);
      })(getCtx());
    });

    it('should pass the second or the further args as is without any modifications to all the handlers', () => {
      pipe(async ({ data }: IContext, ev: string) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.null;

        // to simulate async nature
        await delay(10);

        return 1;
      }, ({ data }: IContext, ev: string) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.eql(1);

        return 2;
      }, ({ data }: IContext, ev: string) => {
        expect(ev).to.be.eql('test');
        expect(data).to.be.eql(2);
      })(getCtx(), 'test');
    });

    it('should be able to stop the pipeline flow by returning nothing | undefined', async () => {
      let calls = 0;
      const data = await pipe(() => {
        calls++;
        return;
      }, () => {
        calls++;
      })(getCtx());

      expect(calls).to.be.eql(1);
      expect(data).to.be.eql(undefined);

      calls = 0;
      await pipe(() => {
        calls++;
      }, () => {
        calls++;
      })(getCtx());

      expect(calls).to.be.eql(1);
      expect(data).to.be.eql(undefined);
    });
  });

  describe('getKeys()', () => {
    it('should return all the keys in the given Map', () => {
      const map = new Map();
      const keys = ['a', 'b'];
      keys.forEach(k => {
        map.set(k, true);
      });

      expect(getKeys(map)).to.contain.all.members(keys);
    });
  });
});
