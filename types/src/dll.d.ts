export declare class DLLItem {
    prev: DLLItem | null;
    next: DLLItem | null;
    meta: any;
    invalid: boolean;
    constructor(prev: DLLItem | null, next: DLLItem | null, meta: any);
    getNext(): DLLItem | null;
}
export default class DLL {
    length: number;
    private head;
    private tail;
    /**
     * Returns the first item in the list
     *
     * @returns first item
     */
    getHead(): DLLItem | null;
    /**
     * Returns the last item in the list
     *
     * @returns last item
     */
    getTail(): DLLItem | null;
    /**
     * Removes and returns the first
     * item in the list
     *
     * @returns Same data that was
     *    used to append to this list
     */
    shift(): any;
    /**
     * Iterate through the entire DLL chain
     *
     * @param cb
     */
    forEach(cb: (data: any, i: number) => void): void;
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
    append(data: any): DLLItem;
    /**
     * Removes the given item from DLL
     *
     * @param dllItem
     */
    remove(dllItem?: DLLItem): boolean;
}
