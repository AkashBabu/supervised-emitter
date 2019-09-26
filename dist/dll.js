"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.DLL = undefined;var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var DLLItem = function () {
  function DLLItem() {var prev = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;var next = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};(0, _classCallCheck3.default)(this, DLLItem);
    this.meta = meta;
    this.next = next;
    this.prev = prev;
  }(0, _createClass3.default)(DLLItem, [{ key: "getNext", value: function getNext()

    {
      return this.next;
    } }]);return DLLItem;}();var


DLL = exports.DLL = function () {
  function DLL() {(0, _classCallCheck3.default)(this, DLL);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }(0, _createClass3.default)(DLL, [{ key: "getHead", value: function getHead()


    {
      return this.head;
    }

    /**
      * This method is in sync with DLLItem
      * such that users can use this method
      * for looping
      *
      * @example
      * let eventHandlers = SE[state].subscribers[matchingEvent];
      * while (eventHandlers = eventHandlers.getNext()) {
      *   eventHandlers.meta.handlers(newData);
      * }
      */ }, { key: "getNext", value: function getNext()
    {
      return this.getHead();
    }

    /**
       * Adds the given item the tail of DLL
       *
       * @param {Object} data
       *
       * @returns {DLLItem} dllItem, the same
       *      can be used to remove this item from
       *      DLL
       */ }, { key: "append", value: function append(
    data) {
      var dllItem = new DLLItem(this.tail, null, data);

      if (this.tail) {
        this.tail.next = dllItem;

        // set this item as the new tail
        this.tail = dllItem;
      } else {
        // if this is the first item in the DLL
        // then it would be the head and the tail
        // of DLL
        this.head = this.tail = dllItem;
      }

      this.length++;

      return dllItem;
    }

    /**
       * Removes the given item from DLL
       *
       * @param {DLLItem} dllItem
       */ }, { key: "remove", value: function remove(
    dllItem) {
      if (dllItem.prev) {
        dllItem.prev.next = dllItem.next;
      } else {
        this.head = dllItem.next;
      }

      if (dllItem.next) {
        dllItem.next.prev = dllItem.prev;
      } else {
        this.tail = dllItem.prev;
      }

      this.length--;
    } }]);return DLL;}();