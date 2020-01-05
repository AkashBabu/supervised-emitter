import 'mocha';
import { expect } from 'chai';
import getMapKeys from '../../src/lib/getMapKeys';

describe('#getMapKeys', () => {
  it('should return all the keys in the given Map', () => {
    const map = new Map();
    const keys = ['a', 'b'];
    keys.forEach(k => {
      map.set(k, true);
    });

    expect(getMapKeys(map)).to.contain.all.members(keys);
  });
});
