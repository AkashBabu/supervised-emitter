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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const delay_1 = __importDefault(require("delay"));
const threadRunner_1 = __importDefault(require("../src/threadRunner"));
describe('#thread-runner', () => {
    it('should be awaitable', () => __awaiter(void 0, void 0, void 0, function* () {
        function worker(task) {
            return __awaiter(this, void 0, void 0, function* () {
                yield delay_1.default(10);
                return task;
            });
        }
        const threadRunner = threadRunner_1.default(worker, { maxRunners: 2 });
        const [[, item1], [, item2], [, item3]] = yield Promise.all([
            threadRunner('item1'),
            threadRunner('item2'),
            threadRunner('item3'),
        ]);
        chai_1.expect(item1).to.be.eql('item1');
        chai_1.expect(item2).to.be.eql('item2');
        chai_1.expect(item3).to.be.eql('item3');
        const [, item4] = yield threadRunner('item4');
        chai_1.expect(item4).to.be.eql('item4');
    }));
    it('should only forward the error and NOT throw it when one is encountered', () => __awaiter(void 0, void 0, void 0, function* () {
        function worker() {
            return __awaiter(this, void 0, void 0, function* () {
                yield delay_1.default(10);
                throw new Error('Failed');
            });
        }
        const threadRunner = threadRunner_1.default(worker, { maxRunners: 2 });
        const [err] = yield threadRunner('item1');
        chai_1.expect(err).to.exist;
    }));
    it('should run atmost the given number of promises at any given instance of time', () => __awaiter(void 0, void 0, void 0, function* () {
        let running = 0;
        function worker(task) {
            return __awaiter(this, void 0, void 0, function* () {
                running++;
                yield delay_1.default(20 + Math.random() * 100);
                running--;
                return task;
            });
        }
        const MAX_RUNNERS = 10;
        const threadRunner = threadRunner_1.default(worker, { maxRunners: MAX_RUNNERS });
        setInterval(() => {
            chai_1.expect(running <= MAX_RUNNERS).to.be.true;
        }, 10);
        const result = yield Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map((_, i) => threadRunner(`item${i}`)));
        result.forEach(([, item], i) => {
            chai_1.expect(item).to.be.eql(`item${i}`);
        });
    }));
    it('should assume a default maxRunners=10', () => __awaiter(void 0, void 0, void 0, function* () {
        let running = 0;
        function worker(task) {
            return __awaiter(this, void 0, void 0, function* () {
                running++;
                yield delay_1.default(20 + Math.random() * 100);
                running--;
                return task;
            });
        }
        const MAX_RUNNERS = 10;
        const threadRunner = threadRunner_1.default(worker);
        setInterval(() => {
            chai_1.expect(running <= MAX_RUNNERS).to.be.true;
        }, 10);
        const result = yield Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map((_, i) => threadRunner(`item${i}`)));
        result.forEach(([, item], i) => {
            chai_1.expect(item).to.be.eql(`item${i}`);
        });
    }));
    it('should run atmost the given number of promises even when a few tasks throw error', () => __awaiter(void 0, void 0, void 0, function* () {
        let running = 0;
        function worker(task) {
            return __awaiter(this, void 0, void 0, function* () {
                running++;
                yield delay_1.default(20 + Math.random() * 100);
                running--;
                const err = !!Math.round(Math.random());
                if (err) {
                    throw new Error('Failed');
                }
                return task;
            });
        }
        const MAX_RUNNERS = 10;
        const threadRunner = threadRunner_1.default(worker, { maxRunners: MAX_RUNNERS });
        setInterval(() => {
            chai_1.expect(running <= MAX_RUNNERS).to.be.true;
        }, 10);
        const result = yield Promise.all(new Array(10 * MAX_RUNNERS).fill(0).map((_, i) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield threadRunner(`item${i}`);
                return res;
            }
            catch (error) {
                return error;
            }
        })));
        result.forEach(([err, item], i) => {
            if (!err) {
                chai_1.expect(item).to.be.eql(`item${i}`);
            }
        });
    }));
});
//# sourceMappingURL=threadRunner.js.map