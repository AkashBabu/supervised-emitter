/**
 * @hidden
 * Task runner options
 */
interface IOptions {
    maxRunners?: number;
}
/**
 * @hidden
 */
export interface ITaskQueue<T> {
    add: (...args: any[]) => Promise<[Error | null, T?]>;
}
/**
 * @hidden
 *
 * Task Runner runs only the
 * controlled number of tasks at any given
 * instance of time.
 *
 * @param worker function to be called for executing the task
 * @param options
 *
 * @returns Task adder function
 */
export default class TaskQueue<T> implements ITaskQueue<T> {
    private worker;
    private tasks;
    private running;
    private options;
    constructor(worker: (...args: any[]) => T, options?: IOptions);
    add(...args: any[]): Promise<[Error | null, T?]>;
    /**
     * This is responsible for running the tasks
     * in parallel and to maintain only the
     * limited number of concurrent tasks
     */
    private runner;
}
export {};
