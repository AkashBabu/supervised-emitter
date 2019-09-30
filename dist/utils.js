"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.compose = compose;exports.pipe = pipe;var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")); /**
                                                                                                                                                                                                                                                                                                                                                                                                     * Composes the list of functions passed.
                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                     * @param  {...function} fns List of functions to be composed
                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                     * @returns function(x) : y
                                                                                                                                                                                                                                                                                                                                                                                                     */
function compose() {for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {fns[_key] = arguments[_key];}
  return composer.apply(void 0, ['reduceRight'].concat(fns));
}

/**
   * Pipes the list of functions passed
   * @param  {...function} fns List of functions
   *
   * @returns function(x) : y
   */
function pipe() {for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {fns[_key2] = arguments[_key2];}
  return composer.apply(void 0, ['reduce'].concat(fns));
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
function composer(method) {for (var _len3 = arguments.length, fns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {fns[_key3 - 1] = arguments[_key3];}
  return function (ctx) {for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {args[_key4 - 1] = arguments[_key4];}
    var hasEnded = false;
    var end = function end(data) {
      hasEnded = true;
      return data;
    };

    ctx.end = end;

    return fns[method]( /*#__PURE__*/function () {var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(y, fn) {return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  y);case 2:ctx.data = _context.sent;if (!



                hasEnded) {_context.next = 5;break;}return _context.abrupt("return", ctx.data);case 5:return _context.abrupt("return",

                fn.apply(void 0, [ctx].concat(args)));case 6:case "end":return _context.stop();}}}, _callee);}));return function (_x, _x2) {return _ref.apply(this, arguments);};}(),
    ctx.data);
  };
}