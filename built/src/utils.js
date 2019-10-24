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
 * Composes the list of functions passed.
 *
 * @param  handlers List of handlers
 *
 * @returns function(x) : y
 */
function compose(...handlers) {
    return composer('reduceRight', ...handlers);
}
exports.compose = compose;
/**
 * Pipes the list of functions passed
 * @param  handlers List of handlers
 */
function pipe(...handlers) {
    return composer('reduce', ...handlers);
}
exports.pipe = pipe;
/**
 * You may create a pipe | compose based
 * on the array method sent
 *
 * @param method Array method to be called
 * @param handlers list of functions
 *
 * @returns Composed function
 */
function composer(method, ...handlers) {
    return (ctx, ...args) => {
        let hasEnded = false;
        const end = (data) => {
            hasEnded = true;
            return data;
        };
        ctx.end = end;
        return handlers[method]((prev, handler) => __awaiter(this, void 0, void 0, function* () {
            ctx.data = yield prev;
            // If the pipeline has ended then
            // do not call further handlers
            if (hasEnded)
                return ctx.data;
            return handler(ctx, ...args);
        }), ctx.data);
    };
}
/**
 * Returns all the keys in the map
 *
 * @param map Map
 *
 * @returns List of keys in the given map
 */
function getKeys(map) {
    const keys = [];
    const keysIter = map.keys();
    let key = keysIter.next();
    while (!key.done) {
        keys.push(key.value);
        key = keysIter.next();
    }
    return keys;
}
exports.getKeys = getKeys;
//# sourceMappingURL=utils.js.map