"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.DLLItem = DLLItem;exports["default"] = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var isUndefined = function isUndefined(d) {return d === undefined || d === null;};

function DLLItem() {var _this = this;var prev = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;var next = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;var meta = arguments.length > 2 ? arguments[2] : undefined;
  if (isUndefined(meta)) this.invalid = true;

  this.meta = meta;
  this.next = next;
  this.prev = prev;

  this.getNext = function () {return _this.next;};
}var

DLL = /*#__PURE__*/function () {
  function DLL() {(0, _classCallCheck2["default"])(this, DLL);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }


  /**
     * Returns the first items in the list
     *
     * @returns {DLLItem}
     */(0, _createClass2["default"])(DLL, [{ key: "getHead", value: function getHead()
    {
      return this.head;
    }

    /**
       * Removes and returns the first
       * item in the list
       *
       * @returns {Object} Same data that was
       *    used to append to this list
       */ }, { key: "shift", value: function shift()
    {
      var dllItem = this.getHead();

      if (!dllItem) return undefined;

      this.remove(dllItem);
      return dllItem.meta;
    }

    /**
       * @callback ForEachCb
       * @param {any} data
       * @param {number} i
       */

    /**
           * Iterate through the entire DLL chain
           *
           * @param {ForEachCb} cb
           */ }, { key: "forEach", value: function forEach(
    cb) {
      var dllItem = this.getHead();
      var i = 0;

      while (dllItem) {
        cb(dllItem.meta, i++);

        dllItem = dllItem.getNext();
      }
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
      if (dllItem.invalid) return null;

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
      if (!(dllItem instanceof DLLItem)) return false;

      // If it's NOT HEAD
      if (dllItem.prev) {
        dllItem.prev.next = dllItem.next;

        // If it's HEAD
      } else {
        this.head = dllItem.next;
      }

      // If it's NOT TAIL
      if (dllItem.next) {
        dllItem.next.prev = dllItem.prev;

        // If it's TAIL
      } else {
        this.tail = dllItem.prev;
      }

      this.length--;
      return true;
    } }]);return DLL;}();exports["default"] = DLL;