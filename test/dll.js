
import { expect } from 'chai';
import { DLL } from '../src/dll';

describe('#dll', () => {
  it('should be able to create a dll', () => {
    const dll = new DLL();
    expect(dll).to.have.keys(['head', 'tail', 'length']);
  });

  it('should be able to append an item', () => {
    const dll = new DLL();
    dll.append({ name: 'test' });

    const dllItem = dll.getHead();
    expect(dllItem).to.exist;
    expect(dllItem.meta.name).to.be.eql('test');
  });

  it('should be able to append many items', () => {
    const dll = new DLL();
    let dllItem = dll;
    const size = 10;
    Array(size).fill(0).forEach((_, i) => {
      dllItem.append({ name: `test${i}` });
    });


    let i = 0;
    while (dllItem = dllItem.getNext()) {
      expect(dllItem).to.exist;
      expect(dllItem.meta.name).to.be.eql(`test${i}`);
      i++;
    }

    expect(i).to.be.eql(dll.length);
    expect(i).to.be.eql(size);
  });

  it('should be able to remove the first item', () => {
    const dll = new DLL();
    let dllItem = dll;
    const items = [];
    const size = 10;
    Array(size).fill(0).forEach((_, i) => {
      items.push(dllItem.append({ name: `test${i}` }));
    });


    let i = 0;
    while (dllItem = dllItem.getNext()) {
      expect(dllItem).to.exist;
      expect(dllItem.meta.name).to.be.eql(`test${i}`);
      i++;
    }
    expect(i).to.be.eql(size);

    dll.remove(items[0]);

    const firstItem = dll.getHead();
    expect(firstItem.meta.name).to.be.eql('test1');
    expect(dll.length).to.be.eql(size - 1);
  });

  it('should be able to remove the last item', () => {
    const dll = new DLL();
    let dllItem = dll;
    const items = [];
    const size = 10;
    Array(size).fill(0).forEach((_, i) => {
      items.push(dllItem.append({ name: `test${i}` }));
    });


    let i = 0;
    while (dllItem = dllItem.getNext()) {
      expect(dllItem).to.exist;
      expect(dllItem.meta.name).to.be.eql(`test${i}`);
      i++;
    }
    expect(i).to.be.eql(size);

    dll.remove(items[size - 1]);

    const lastItem = dll.tail;
    expect(lastItem.meta.name).to.be.eql(`test${(size - 1) - 1}`);
    expect(dll.length).to.be.eql(size - 1);
  });

  it('should be able to remove any item in between first and last item', () => {
    const dll = new DLL();
    let dllItem = dll;
    const items = [];
    const size = 10;
    Array(size).fill(0).forEach((_, i) => {
      items.push(dllItem.append({ name: `test${i}` }));
    });


    let i = 0;
    while (dllItem = dllItem.getNext()) {
      expect(dllItem).to.exist;
      expect(dllItem.meta.name).to.be.eql(`test${i}`);
      i++;
    }
    expect(i).to.be.eql(size);

    const removeIndex = parseInt(size / 2, 10);
    dll.remove(items[removeIndex]);

    dllItem = dll;
    while (dllItem = dllItem.getNext()) {
      expect(dllItem.meta.name).not.to.be.eql(`test${removeIndex}`);
    }

    expect(dll.length).to.be.eql(size - 1);
  });

  it('should return the first item on getNext()', () => {
    const dll = new DLL();
    const items = [];
    const size = 10;
    Array(size).fill(0).forEach((_, i) => {
      items.push(dll.append({ name: `test${i}` }));
    });

    expect(dll.getHead()).to.be.eql(dll.getNext());
  });
});
