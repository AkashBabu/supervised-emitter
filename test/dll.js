
import { expect } from 'chai';
import DLL, { DLLItem } from '../src/dll';

describe('#dll', () => {
  it('should be able to create a dll', () => {
    const dll = new DLL();
    expect(dll).to.have.keys(['head', 'tail', 'length']);
  });

  describe('.append()', () => {
    it('should be able to append an item', () => {
      const dll = new DLL();
      dll.append({ name: 'test' });

      const dllItem = dll.getHead();
      expect(dllItem).to.exist;
      expect(dllItem.meta.name).to.be.eql('test');
    });

    it('should be able to append many items', () => {
      const dll = new DLL();
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        dll.append({ name: `test${i}` });
      });


      dll.forEach((data, i) => {
        expect(data).to.exist;
        expect(data.name).to.be.eql(`test${i}`);
      });
    });

    it('should return the appended dllItem on successful append', () => {
      const dll = new DLL();
      const dllItem = dll.append({ name: 'test' });

      expect(dllItem).to.be.an.instanceOf(DLLItem);
      expect(dllItem.meta.name).to.be.eql('test');
    });

    it('should return null if we try to append an empty item', () => {
      const dll = new DLL();
      const dllItem = dll.append();

      expect(dllItem).to.be.null;
    });
  });


  describe('.remove()', () => {
    it('should return true on successful removal', () => {
      const dll = new DLL();
      const dllItem = dll.append({ name: 'test' });

      expect(dll.remove(dllItem)).to.be.true;
    });

    it('should return false, when there are no items to be removed', () => {
      const dll = new DLL();

      expect(dll.remove()).to.be.false;
    });


    it('should be able to remove the first item', () => {
      const dll = new DLL();
      const items = [];
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        items.push(dll.append({ name: `test${i}` }));
      });

      expect(dll.remove(items[0])).to.be.true;

      const firstItem = dll.getHead();
      expect(firstItem.meta.name).to.be.eql('test1');
      expect(dll.length).to.be.eql(size - 1);
    });

    it('should be able to remove the last item', () => {
      const dll = new DLL();
      const items = [];
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        items.push(dll.append({ name: `test${i}` }));
      });

      expect(dll.remove(items[size - 1])).to.be.true;

      const lastItem = dll.tail;
      expect(lastItem.meta.name).to.be.eql(`test${(size - 1) - 1}`);
      expect(dll.length).to.be.eql(size - 1);
    });

    it('should be able to remove any item in between first and last item', () => {
      const dll = new DLL();
      const items = [];
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        items.push(dll.append({ name: `test${i}` }));
      });

      const removeIndex = parseInt(size / 2, 10);
      expect(dll.remove(items[removeIndex])).to.be.true;

      dll.forEach(data => {
        expect(data.name).not.to.be.eql(`test${removeIndex}`);
      });

      expect(dll.length).to.be.eql(size - 1);
    });
  });

  describe('.getHead()', () => {
    it('should return the first item in the list', () => {
      const dll = new DLL();
      const items = [];
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        items.push(dll.append({ name: `test${i}` }));
      });

      const firstItem = dll.getHead();
      expect(firstItem).to.be.eql(items[0]);
    });
    it('should return null when there are no items in the list', () => {
      const dll = new DLL();

      expect(dll.getHead()).to.be.null;
    });
  });

  describe('.forEach()', () => {
    it('should iterate through the entire list', () => {
      const dll = new DLL();
      const items = [];
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        const item = { name: `test${i}` };
        dll.append(item);
        items.push(item);
      });

      dll.forEach((data, i) => {
        expect(items[i]).to.be.eql(data);
      });
    });

    it('should not call the iteratee if there are no items in the list', () => {
      const dll = new DLL();

      let calls = 0;
      const cb = () => calls++;

      dll.forEach(cb);
      expect(calls).to.be.eql(0);
    });
  });

  describe('.shift()', () => {
    it('should remove the head item and return the same', () => {
      const dll = new DLL();
      const size = 10;
      Array(size).fill(0).forEach((_, i) => {
        const item = { name: `test${i}` };
        dll.append(item);
      });

      const { name } = dll.shift();
      expect(name).to.be.eql('test0');
      expect(dll.length).to.be.eql(size - 1);
    });
    it('should return undefined if the list is empty', () => {
      const dll = new DLL();

      expect(dll.shift()).to.be.undefined;
    });
  });

  describe('.length', () => {
    it('should return the current number of items in the list', () => {
      const dll = new DLL();
      expect(dll.length).to.be.eql(0);

      const dllItem1 = dll.append({ name: 'test1' });
      dll.append({ name: 'test2' });
      dll.append({ name: 'test3' });

      expect(dll.length).to.be.eql(3);

      expect(dll.remove(dllItem1)).to.be.true;
      expect(dll.length).to.be.eql(2);

      dll.shift();
      expect(dll.length).to.be.eql(1);
    });
  });
});
