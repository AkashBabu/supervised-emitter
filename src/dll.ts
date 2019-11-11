
type IIteratorCb<T> = (data: any, i: number) => T;

// Returns whether the given data is `undefined` or `null`
const isUndefined = (d: any): boolean => d === undefined || d === null;

export class DLLItem {
  public invalid = false;

  constructor(public prev: DLLItem | null = null, public next: DLLItem | null = null, public meta: any) {
    if (isUndefined(meta)) this.invalid = true;
  }

  public getNext(): DLLItem | null {
    return this.next;
  }
}

export default class DLL {
  public length: number = 0;
  private head: DLLItem | null = null;
  private tail: DLLItem | null = null;

  /**
   * Returns the first item in the list
   *
   * @returns first item
   */
  public getHead(): DLLItem | null {
    return this.head;
  }

  /**
   * Returns the last item in the list
   *
   * @returns last item
   */
  public getTail(): DLLItem | null {
    return this.tail;
  }

  /**
   * Removes and returns the first
   * item in the list
   *
   * @returns Same data that was
   *    used to append to this list
   */
  public shift(): any {
    const dllItem = this.getHead();

    if (!dllItem) return undefined;

    this.remove(dllItem);
    return dllItem.meta;
  }

  /**
   * Iterate through the entire DLL chain
   *
   * @param cb
   */
  public forEach<T>(cb: IIteratorCb<T>): void {
    let dllItem = this.getHead();
    let i = 0;

    while (dllItem) {
      cb(dllItem.meta, i++);

      dllItem = dllItem.getNext();
    }
  }

  public map<T>(cb: IIteratorCb<T>): T[] {
    const mapped: T[] = [];
    this.forEach((data, i) => {
      mapped.push(cb(data, i));
    });

    return mapped;
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
  public append(data: any): DLLItem {
    const dllItem = new DLLItem(this.tail, null, data);
    if (dllItem.invalid) throw new Error('Can\'t append undefined or null to a DLL chain');

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
   * @param dllItem
   */
  public remove(dllItem?: DLLItem): boolean {
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
