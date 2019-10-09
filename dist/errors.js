"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.SingletonError = exports.InvalidPatternError = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper")); /* eslint-disable max-classes-per-file */

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * This error will be thrown when an invalid wildcards sequence
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * is detected
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */var
InvalidPatternError = /*#__PURE__*/function (_Error) {(0, _inherits2["default"])(InvalidPatternError, _Error);
  function InvalidPatternError() {var _this;(0, _classCallCheck2["default"])(this, InvalidPatternError);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(InvalidPatternError).call(this, 'DO NOT use **/*, */**, **/** in your event string because it is equivalent to using /**/'));

    _this.name = _this.constructor.name;

    Error.captureStackTrace((0, _assertThisInitialized2["default"])(_this), _this.constructor);return _this;
  }return InvalidPatternError;}((0, _wrapNativeSuper2["default"])(Error));



/**
                                                                            * Thrown if SupervisedEmitter is initialized more than once
                                                                            */exports.InvalidPatternError = InvalidPatternError;var
SingletonError = /*#__PURE__*/function (_Error2) {(0, _inherits2["default"])(SingletonError, _Error2);
  function SingletonError() {var _this2;(0, _classCallCheck2["default"])(this, SingletonError);
    _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SingletonError).call(this, 'Can\'t initialize singleton => "SupervisedEmitter", more than once'));

    _this2.name = _this2.constructor.name;
    Error.captureStackTrace((0, _assertThisInitialized2["default"])(_this2), _this2.constructor);return _this2;
  }return SingletonError;}((0, _wrapNativeSuper2["default"])(Error));exports.SingletonError = SingletonError;