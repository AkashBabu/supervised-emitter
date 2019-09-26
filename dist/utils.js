'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.pipe = exports.compose = undefined;var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Composes the list of functions passed.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @param  {...function} fns List of functions to be composed
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @returns function(x) : y
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
function compose() {for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {fns[_key] = arguments[_key];}
  return composer.apply(undefined, ['reduceRight'].concat(fns));
}

/**
   * Pipes the list of functions passed
   * @param  {...function} fns List of functions
   *
   * @returns function(x) : y
   */
function pipe() {for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {fns[_key2] = arguments[_key2];}
  return composer.apply(undefined, ['reduce'].concat(fns));
}


/**
   * You may create a pipe | compose based
   * on the array method sent
   *
   * @param {String} method Array method to be called
   * @param  {...function} fns list of functions
   *
   * @returns function(x) : y
   */
function composer(method) {var _this = this;for (var _len3 = arguments.length, fns = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {fns[_key3 - 1] = arguments[_key3];}
  return function (ctx) {for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {args[_key4 - 1] = arguments[_key4];}return fns[method](function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(y, fn) {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  y);case 2:ctx.data = _context.sent;return _context.abrupt('return',
                fn.apply(undefined, [ctx].concat(args)));case 4:case 'end':return _context.stop();}}}, _callee, _this);}));return function (_x, _x2) {return _ref.apply(this, arguments);};}(),
    ctx.data);};
}exports.

compose = compose;exports.pipe = pipe;