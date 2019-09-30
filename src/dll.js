function DLLItem(prev = null, next = null, meta = {}) {
  this.meta = meta;
  this.next = next;
  this.prev = prev;

  this.getNext = () => this.next;
}

export class DLL {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }


  getHead() {
    return this.head;
  }

  /**
  * This method is in sync with DLLItem
  * such that users can use this method
  * for looping
  *
  * @example
  * let eventHandlers = SE[state].subscribers[matchingEvent];
  * while (eventHandlers = eventHandlers.getNext()) {
  *   eventHandlers.meta.handlers(newData);
  * }
  */
  getNext() {
    return this.getHead();
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
    if (dllItem.prev) {
      dllItem.prev.next = dllItem.next;
    } else {
      this.head = dllItem.next;
    }

    if (dllItem.next) {
      dllItem.next.prev = dllItem.prev;
    } else {
      this.tail = dllItem.prev;
    }

    this.length--;
  }
}
