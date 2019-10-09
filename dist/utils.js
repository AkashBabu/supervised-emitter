"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.compose = compose;exports.pipe = pipe;exports.getKeys = getKeys;var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")); /**
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
   * @returns {(x, ...args) => y}
   */
function composer(method) {for (var _len3 = arguments.length, fns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {fns[_key3 - 1] = arguments[_key3];}
  return (/*#__PURE__*/function () {var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(ctx) {var _len4,args,_key4,hasEnded,end,_args2 = arguments;return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:for (_len4 = _args2.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {args[_key4 - 1] = _args2[_key4];}
                hasEnded = false;
                end = function end(data) {
                  hasEnded = true;
                  return data;
                };

                ctx.end = end;return _context2.abrupt("return",

                fns[method]( /*#__PURE__*/function () {var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(y, fn) {return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                              y);case 2:ctx.data = _context.sent;if (!



                            hasEnded) {_context.next = 5;break;}return _context.abrupt("return", ctx.data);case 5:return _context.abrupt("return",

                            fn.apply(void 0, [ctx].concat(args)));case 6:case "end":return _context.stop();}}}, _callee);}));return function (_x2, _x3) {return _ref2.apply(this, arguments);};}(),
                ctx.data));case 5:case "end":return _context2.stop();}}}, _callee2);}));return function (_x) {return _ref.apply(this, arguments);};}());

}


/**
   * Returns all the keys in the map
   *
   * @param {Map} map Map
   *
   * @returns {String[]} key list
   */
function getKeys(map) {
  var keys = [];
  var keysIter = map.keys();
  var key = keysIter.next();
  while (!key.done) {
    keys.push(key.value);
    key = keysIter.next();
  }

  return keys;
}