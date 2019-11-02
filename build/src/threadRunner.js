"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return __awaiter(this, void 0, void 0, function* () {
            if (running < maxRunners) {
                running++;
                const task = tasks.shift();
                if (task) {
                    const { args, resolve } = task;
                    try {
                        const data = yield worker(...args);
                        resolve([null, data]);
                    }
                    catch (error) {
                        resolve([error]);
                    }
                    running--;
                    // assuming a new task might be present,
                    // we're calling the runner again.
                    runner();
                }
                else {
                    // since no task has been found,
                    // we'll exit the runner process
                    running--;
                }
            }
        });
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