import DLL from './dll';

/**
 * Thread Runner runs only the
 * controlled number of threads at any given
 * instance of time.
 *
 * @param {Function} worker function to be called for executing the task
 * @param {{maxRunners: Number}} options
 *
 * @returns {Function} Task adder function
 */
export default function ThreadRunner(worker, { maxRunners = 10 }) {
  // Tasks are maintained in a DLL such
  // that it is easier during removal of task
  // as DLLs don't need splicing of Array
  const tasks = new DLL();

  // number of currently running threads
  let running = 0;

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
        const { args, resolve, reject } = task;
        try {
          const data = await worker(...args);
          resolve(data);
        } catch (err) {
          reject(err);
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

  return async (...args) => new Promise((resolve, reject) => {
    // add task to DLL
    tasks.append({
      args,
      resolve,
      reject,
    });

    // inform runner about the new task
    runner();
  });
}
