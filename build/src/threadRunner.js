"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Thread Runner runs only the
 * controlled number of threads at any given
 * instance of time.
 *
 * @param worker function to be called for executing the task
 * @param options
 *
 * @returns Task adder function
 */
function ThreadRunner(worker, { maxRunners = 10 } = {}) {
    const tasks = [];
    // number of currently running threads
    let running = 0;
    /**
     * This is responsible for running the tasks
     * in parallel and to maintain only the
     * limited number of concurrent threads
     */
    function runner() {
        if (running < maxRunners) {
            running++;
            const task = tasks.shift();
            if (task) {
                const { args, resolve } = task;
                worker(...args)
                    .then((d) => resolve([null, d]))
                    .catch((err) => resolve([err]))
                    .finally(() => {
                    running--;
                    // assuming a new task might be present,
                    // we're calling the runner again.
                    runner();
                });
            }
            else {
                // since no task has been found,
                // we'll exit the runner process
                running--;
            }
        }
    }
    runner();
    return (...args) => new Promise((resolve) => {
        // add task to DLL
        tasks.push({
            args,
            resolve,
        });
        // inform runner about the new task
        runner();
    });
}
exports.default = ThreadRunner;
//# sourceMappingURL=threadRunner.js.map