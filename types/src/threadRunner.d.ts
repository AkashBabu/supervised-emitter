/**
 * @hidden
 * Thread runner options
 */
interface IOptions {
    maxRunners?: number;
}
/**
 * @hidden
 */
export declare type IRunTask = (...args: any[]) => Promise<any>;
/**
 * @hidden
 *
 * Thread Runner runs only the
 * controlled number of threads at any given
 * instance of time.
 *
 * @param worker function to be called for executing the task
 * @param options
 *
 * @returns Task adder function
 */
export default function ThreadRunner(worker: (...args: any[]) => any, { maxRunners }?: IOptions): IRunTask;
export {};
