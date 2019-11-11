/**
 * @hidden
 * Thread runner options
 */
interface IOptions {
  maxRunners?: number;
}

/**
 * @hidden
 * New task interface
 */
interface ITask {
  args: any[];
  resolve([err, data]: any[]): void;
}

/**
 * @hidden
 */
export type IRunTask = (...args: any[]) => Promise<any>;

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
export default function ThreadRunner(worker: (...args: any[]) => any, { maxRunners = 10 }: IOptions = {}): IRunTask {
  const tasks: ITask[] = [];

  // number of currently running threads
  let running: number = 0;

  /**
   * This is responsible for running the tasks
   * in parallel and to maintain only the
   * limited number of concurrent threads
   */
  async function runner() {
    if (running < maxRunners) {
      running++;

      const task = tasks.shift();
      if (task) {
        const { args, resolve } = task;

        try {
          const data = await worker(...args);
          resolve([null, data]);
        } catch (error) {
          resolve([error]);
        }

        running--;

        // assuming a new task might be present,
        // we're calling the runner again.
        runner();
      } else {
        // since no task has been found,
        // we'll exit the runner process
        running--;
      }
    }
  }
  runner();

  return (...args: any[]) => new Promise((resolve) => {
    // add task to DLL
    tasks.push({
      args,
      resolve,
    });

    // inform runner about the new task
    runner();
  });
}
