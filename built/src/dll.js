"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Returns whether the given data is `undefined` or `null`
const isUndefined = (d) => d === undefined || d === null;
class DLLItem {
    constructor(prev = null, next = null, meta) {
        this.prev = prev;
        this.next = next;
        this.meta = meta;
        this.invalid = false;
        if (isUndefined(meta))
            this.invalid = true;
    }
    getNext() {
        return this.next;
    }
}
exports.DLLItem = DLLItem;
class DLL {
    constructor() {
        this.length = 0;
        this.head = null;
        this.tail = null;
    }
    /**
     * Returns the first item in the list
     *
     * @returns first item
     */
    getHead() {
        return this.head;
    }
    /**
     * Returns the last item in the list
     *
     * @returns last item
     */
    getTail() {
        return this.tail;
    }
    /**
     * Removes and returns the first
     * item in the list
     *
     * @returns Same data that was
     *    used to append to this list
     */
    shift() {
        const dllItem = this.getHead();
        if (!dllItem)
            return undefined;
        this.remove(dllItem);
        return dllItem.meta;
    }
    /**
     * Iterate through the entire DLL chain
     *
     * @param cb
     */
    forEach(cb) {
        let dllItem = this.getHead();
        let i = 0;
        while (dllItem) {
            cb(dllItem.meta, i++);
            dllItem = dllItem.getNext();
        }
    }
    /**
     * Adds the given item the tail of DLL
     *
     * @param data
     *
     * @returns {DLLItem} dllItem, the same
     *      can be used to remove this item from
     *      DLL
     *
     * @throws Invalid data exception
     */
    append(data) {
        const dllItem = new DLLItem(this.tail, null, data);
        if (dllItem.invalid)
            throw new Error('Can\'t append undefined or null to a DLL chain');
        if (this.tail) {
            this.tail.next = dllItem;
            // set this item as the new tail
            this.tail = dllItem;
        }
        else {
            // if this is the first item in the DLL
            // then it would be the head and the tail
            // of DLL
            this.head = this.tail = dllItem;
        }
        this.length++;
        return dllItem;
    }
    /**
     * Removes the given item from DLL
     *
     * @param dllItem
     */
    remove(dllItem) {
        if (!(dllItem instanceof DLLItem))
            return false;
        // If it's NOT HEAD
        if (dllItem.prev) {
            dllItem.prev.next = dllItem.next;
            // If it's HEAD
        }
        else {
            this.head = dllItem.next;
        }
        // If it's NOT TAIL
        if (dllItem.next) {
            dllItem.next.prev = dllItem.prev;
            // If it's TAIL
        }
        else {
            this.tail = dllItem.prev;
        }
        this.length--;
        return true;
    }
}
exports.default = DLL;
//# sourceMappingURL=dll.js.map