"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const dll_1 = __importStar(require("../src/dll"));
describe('#dll', () => {
    it('should be able to create a dll', () => {
        const dll = new dll_1.default();
        chai_1.expect(dll).to.have.keys(['head', 'tail', 'length']);
    });
    describe('.append()', () => {
        it('should be able to append an item', () => {
            const dll = new dll_1.default();
            dll.append({ name: 'test' });
            const dllItem = dll.getHead();
            chai_1.expect(dllItem).to.exist;
            chai_1.expect(dllItem.meta.name).to.be.eql('test');
        });
        it('should be able to append many items', () => {
            const dll = new dll_1.default();
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                dll.append({ name: `test${i}` });
            });
            dll.forEach((data, i) => {
                chai_1.expect(data).to.exist;
                chai_1.expect(data.name).to.be.eql(`test${i}`);
            });
        });
        it('should return the appended dllItem on successful append', () => {
            const dll = new dll_1.default();
            const dllItem = dll.append({ name: 'test' });
            chai_1.expect(dllItem).to.be.an.instanceOf(dll_1.DLLItem);
            chai_1.expect(dllItem.meta.name).to.be.eql('test');
        });
        it('should throw an exceptionif we try to append an empty item', () => {
            const dll = new dll_1.default();
            chai_1.expect(() => dll.append(null)).to.throw(/Can\'t append/);
            chai_1.expect(() => dll.append(undefined)).to.throw(/Can\'t append/);
        });
    });
    describe('.remove()', () => {
        it('should return true on successful removal', () => {
            const dll = new dll_1.default();
            const dllItem = dll.append({ name: 'test' });
            chai_1.expect(dll.remove(dllItem)).to.be.true;
        });
        it('should return false, when there are no items to be removed', () => {
            const dll = new dll_1.default();
            chai_1.expect(dll.remove()).to.be.false;
        });
        it('should be able to remove the first item', () => {
            const dll = new dll_1.default();
            const items = [];
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                items.push(dll.append({ name: `test${i}` }));
            });
            chai_1.expect(dll.remove(items[0])).to.be.true;
            const firstItem = dll.getHead();
            chai_1.expect(firstItem.meta.name).to.be.eql('test1');
            chai_1.expect(dll.length).to.be.eql(size - 1);
        });
        it('should be able to remove the last item', () => {
            const dll = new dll_1.default();
            const items = [];
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                items.push(dll.append({ name: `test${i}` }));
            });
            chai_1.expect(dll.remove(items[size - 1])).to.be.true;
            const lastItem = dll.getTail();
            chai_1.expect(lastItem.meta.name).to.be.eql(`test${(size - 1) - 1}`);
            chai_1.expect(dll.length).to.be.eql(size - 1);
        });
        it('should be able to remove any item in between first and last item', () => {
            const dll = new dll_1.default();
            const items = [];
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                items.push(dll.append({ name: `test${i}` }));
            });
            const removeIndex = size / 2;
            chai_1.expect(dll.remove(items[removeIndex])).to.be.true;
            dll.forEach(data => {
                chai_1.expect(data.name).not.to.be.eql(`test${removeIndex}`);
            });
            chai_1.expect(dll.length).to.be.eql(size - 1);
        });
    });
    describe('.getHead()', () => {
        it('should return the first item in the list', () => {
            const dll = new dll_1.default();
            const items = [];
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                items.push(dll.append({ name: `test${i}` }));
            });
            const firstItem = dll.getHead();
            chai_1.expect(firstItem).to.be.eql(items[0]);
        });
        it('should return null when there are no items in the list', () => {
            const dll = new dll_1.default();
            chai_1.expect(dll.getHead()).to.be.null;
        });
    });
    describe('.forEach()', () => {
        it('should iterate through the entire list', () => {
            const dll = new dll_1.default();
            const items = [];
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                const item = { name: `test${i}` };
                dll.append(item);
                items.push(item);
            });
            dll.forEach((data, i) => {
                chai_1.expect(items[i]).to.be.eql(data);
            });
        });
        it('should not call the iteratee if there are no items in the list', () => {
            const dll = new dll_1.default();
            let calls = 0;
            const cb = () => calls++;
            dll.forEach(cb);
            chai_1.expect(calls).to.be.eql(0);
        });
    });
    describe('.shift()', () => {
        it('should remove the head item and return the same', () => {
            const dll = new dll_1.default();
            const size = 10;
            Array(size).fill(0).forEach((_, i) => {
                const item = { name: `test${i}` };
                dll.append(item);
            });
            const { name } = dll.shift();
            chai_1.expect(name).to.be.eql('test0');
            chai_1.expect(dll.length).to.be.eql(size - 1);
        });
        it('should return undefined if the list is empty', () => {
            const dll = new dll_1.default();
            chai_1.expect(dll.shift()).to.be.undefined;
        });
    });
    describe('.length', () => {
        it('should return the current number of items in the list', () => {
            const dll = new dll_1.default();
            chai_1.expect(dll.length).to.be.eql(0);
            const dllItem1 = dll.append({ name: 'test1' });
            dll.append({ name: 'test2' });
            dll.append({ name: 'test3' });
            chai_1.expect(dll.length).to.be.eql(3);
            chai_1.expect(dll.remove(dllItem1)).to.be.true;
            chai_1.expect(dll.length).to.be.eql(2);
            dll.shift();
            chai_1.expect(dll.length).to.be.eql(1);
        });
    });
    describe('.map()', () => {
        it('should iterate through the entire chain and return an array of returned values from callback', () => {
            const dll = new dll_1.default();
            new Array(10).fill(0).forEach((_, i) => {
                dll.append({ item: `item_${i}` });
            });
            const mapped = dll.map(({ item }, i) => {
                chai_1.expect(item).to.be.eql(`item_${i}`);
                return item;
            });
            mapped.forEach((item, i) => {
                chai_1.expect(item).to.be.eql(`item_${i}`);
            });
        });
    });
});
//# sourceMappingURL=dll.js.map