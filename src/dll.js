const isUndefined = d => d === undefined || d === null;

export function DLLItem(prev = null, next = null, meta) {
  if (isUndefined(meta)) this.invalid = true;

  this.meta = meta;
  this.next = next;
  this.prev = prev;

  this.getNext = () => this.next;
}

export default class DLL {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }


  /**
   * Returns the first items in the list
   *
   * @returns {DLLItem}
   */
  getHead() {
    return this.head;
  }

  /**
   * Removes and returns the first
   * item in the list
   *
   * @returns {Object} Same data that was
   *    used to append to this list
   */
  shift() {
    const dllItem = this.getHead();

    if (!dllItem) return undefined;

    this.remove(dllItem);
    return dllItem.meta;
  }

  /**
   * @callback ForEachCb
   * @param {any} data
   * @param {number} i
   */

  /**
   * Iterate through the entire DLL chain
   *
   * @param {ForEachCb} cb
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
   * @param {Object} data
   *
   * @returns {DLLItem} dllItem, the same
   *      can be used to remove this item from
   *      DLL
   */
  append(data) {
    const dllItem = new DLLItem(this.tail, null, data);
    if (dllItem.invalid) return null;

    if (this.tail) {
      this.tail.next = dllItem;

      // set this item as the new tail
      this.tail = dllItem;
    } else {
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
   * @param {DLLItem} dllItem
   */
  remove(dllItem) {
    if (!(dllItem instanceof DLLItem)) return false;

    // If it's NOT HEAD
    if (dllItem.prev) {
      dllItem.prev.next = dllItem.next;

    // If it's HEAD
    } else {
      this.head = dllItem.next;
    }

    // If it's NOT TAIL
    if (dllItem.next) {
      dllItem.next.prev = dllItem.prev;

    // If it's TAIL
    } else {
      this.tail = dllItem.prev;
    }

    this.length--;
    return true;
  }
}
