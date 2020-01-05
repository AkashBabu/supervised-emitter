import mergeOptions from './mergeOptions';

/**
 * @hidden
 * Task runner options
 */
interface IOptions {
  maxRunners?: number;
}

interface IOptionsInt {
  maxRunners: number;
}

/**
 * @hidden
 * New task interface
 */
interface ITask<T> {
  args: any[];
  resolve([err, data]: [Error | null, T?]): void;
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
  private tasks: Array<ITask<T>> = [];
  private running: number = 0;
  private options: IOptionsInt;

  constructor(private worker: (...args: any[]) => T, options: IOptions = {}) {
    this.options = mergeOptions(options, {
      maxRunners: 10,
    });
  }

  public add(...args: any[]): Promise<[Error | null, T?]> {
    return new Promise((resolve) => {
      // add task to DLL
      this.tasks.push({
        args,
        resolve,
      });

      // inform runner about the new task
      this.runner();
    });
  }

  /**
   * This is responsible for running the tasks
   * in parallel and to maintain only the
   * limited number of concurrent tasks
   */
  private async runner() {
    if (this.running < this.options.maxRunners) {
      this.running++;

      const task = this.tasks.shift();
      if (task) {
        const { args, resolve } = task;

        try {
          const data = await this.worker(...args);
          resolve([null, data]);
        } catch (error) {
          resolve([error]);
        }

        this.running--;

        // assuming a new task might be present,
        // we're calling the runner again.
        this.runner();
      } else {
        // since no task has been found,
        // we'll exit the runner process
        this.running--;
      }
    }
  }
}

// export default function TaskQueue(worker: (...args: any[]) => any, { maxRunners = 10 }: IOptions = {}): IRunTask {
//   const tasks: ITask[] = [];

//   // number of currently running tasks
//   const running: number = 0;

//   runner();

//   return {
//     add(...args: any[]) {
//       return new Promise((resolve) => {
//         // add task to DLL
//         tasks.push({
//           args,
//           resolve,
//         });

//         // inform runner about the new task
//         runner();
//       });
//     },
//   };
// }
