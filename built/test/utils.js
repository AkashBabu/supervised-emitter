"use strict";
/* tslint:disable no-unused-expression */
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
require("mocha");
const chai_1 = require("chai");
const delay_1 = __importDefault(require("delay"));
const utils_1 = require("../src/utils");
describe('#utils', () => {
    describe('compose()', () => {
        it('should compose all the given handlers', () => {
            let processedId = 0;
            utils_1.compose(() => {
                chai_1.expect(processedId).to.be.eql(2);
            }, () => {
                chai_1.expect(processedId).to.be.eql(1);
                processedId = 2;
            }, () => {
                chai_1.expect(processedId).to.be.eql(0);
                processedId = 1;
            })({ data: null });
        });
        it('should compose all async handlers', () => __awaiter(void 0, void 0, void 0, function* () {
            let processedId = 0;
            utils_1.compose(() => {
                chai_1.expect(processedId).to.be.eql(2);
            }, () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(processedId).to.be.eql(1);
                yield new Promise(res => setTimeout(() => {
                    processedId = 2;
                    res();
                }, 10));
            }), () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(processedId).to.be.eql(0);
                yield new Promise(res => setTimeout(() => {
                    processedId = 1;
                    res();
                }, 10));
            }))({ data: null });
        }));
    });
    describe('pipe()', () => {
        it('should pipe all the handlers', () => {
            let processedId = 0;
            utils_1.pipe(() => {
                chai_1.expect(processedId).to.be.eql(0);
                processedId = 1;
            }, () => {
                chai_1.expect(processedId).to.be.eql(1);
                processedId = 2;
            }, () => {
                chai_1.expect(processedId).to.be.eql(2);
            })({ data: null });
        });
        it('should pipe all async handlers', () => {
            let processedId = 0;
            utils_1.pipe(() => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(processedId).to.be.eql(0);
                yield new Promise(res => setTimeout(() => {
                    processedId = 1;
                    res();
                }, 10));
            }), () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(processedId).to.be.eql(1);
                yield new Promise(res => setTimeout(() => {
                    processedId = 2;
                    res();
                }, 10));
            }), () => {
                chai_1.expect(processedId).to.be.eql(2);
            })({ data: null });
        });
        it('should pass on the results returned by intermediate handler to next handler', () => {
            utils_1.pipe(({ data }) => {
                chai_1.expect(data).to.be.null;
                return 1;
            }, ({ data }) => {
                chai_1.expect(data).to.be.eql(1);
                return 2;
            }, ({ data }) => {
                chai_1.expect(data).to.be.eql(2);
            })({ data: null });
        });
        it('should pass the second or the further args as is without any modifications to all the handlers', () => {
            utils_1.pipe(({ data }, ev) => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(ev).to.be.eql('test');
                chai_1.expect(data).to.be.null;
                // to simulate async nature
                yield delay_1.default(10);
                return 1;
            }), ({ data }, ev) => {
                chai_1.expect(ev).to.be.eql('test');
                chai_1.expect(data).to.be.eql(1);
                return 2;
            }, ({ data }, ev) => {
                chai_1.expect(ev).to.be.eql('test');
                chai_1.expect(data).to.be.eql(2);
            })({ data: null }, 'test');
        });
        it('should be able to stop the pipeline flow when "end()" is called', () => __awaiter(void 0, void 0, void 0, function* () {
            let calls = 0;
            const data = yield utils_1.pipe(() => {
                calls++;
            }, ({ end }) => {
                calls++;
                return end('test');
            }, () => {
                calls++;
            })({ data: null });
            chai_1.expect(calls).to.be.eql(2);
            chai_1.expect(data).to.be.eql('test');
        }));
    });
});
//# sourceMappingURL=utils.js.map