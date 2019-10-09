"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = ThreadRunner;var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _dll = _interopRequireDefault(require("./dll"));

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
function ThreadRunner(worker, _ref) {var _ref$maxRunners = _ref.maxRunners,maxRunners = _ref$maxRunners === void 0 ? 10 : _ref$maxRunners;
  // Tasks are maintained in a DLL such
  // that it is easier during removal of task
  // as DLLs don't need splicing of Array
  var tasks = new _dll["default"]();

  // number of currently running threads
  var running = 0;

  /**
                    * This is responsible for running the tasks
                    * in parallel and to maintain only the
                    * limited number of concurrent threads
                    */function
  runner() {return _runner.apply(this, arguments);}function _runner() {_runner = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {var task, args, resolve, reject, data;return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!(
              running < maxRunners)) {_context2.next = 20;break;}
              running++;

              task = tasks.shift();if (!
              task) {_context2.next = 19;break;}
              args = task.args, resolve = task.resolve, reject = task.reject;_context2.prev = 5;_context2.next = 8;return (

                worker.apply(void 0, (0, _toConsumableArray2["default"])(args)));case 8:data = _context2.sent;
              resolve(data);_context2.next = 15;break;case 12:_context2.prev = 12;_context2.t0 = _context2["catch"](5);

              reject(_context2.t0);case 15:


              running--;

              // assuming a new task might be present,
              // we're calling the runner again.
              runner();_context2.next = 20;break;case 19:

              // since no task has been found,
              // we'll exit the runner process
              running--;case 20:case "end":return _context2.stop();}}}, _callee2, null, [[5, 12]]);}));return _runner.apply(this, arguments);}



  runner();

  return (/*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {var _len,args,_key,_args = arguments;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = _args[_key];}return _context.abrupt("return", new Promise(function (resolve, reject) {
                // add task to DLL
                tasks.append({
                  args: args,
                  resolve: resolve,
                  reject: reject });


                // inform runner about the new task
                runner();
              }));case 2:case "end":return _context.stop();}}}, _callee);})));
}