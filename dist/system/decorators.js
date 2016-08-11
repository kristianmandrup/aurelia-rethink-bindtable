System.register(['./bindable', 'socket.io-client'], function (_export) {
  'use strict';

  var Bindable, io;

  _export('bindable', bindable);

  function bindable(tableName) {
    var socketHost = arguments.length <= 1 || arguments[1] === undefined ? 'localhost' : arguments[1];

    return function (target, key, descriptor) {
      target.tableName = tableName;
      target.socketHost = socketHost;

      Object.defineProperty(target.prototype, 'rows', {
        get: function get() {
          return this.bound.rows;
        }
      });

      Object.defineProperty(target, 'table', {
        get: function get() {
          return this.bound.table;
        }
      });
    };
  }

  return {
    setters: [function (_bindable) {
      Bindable = _bindable['default'];
    }, function (_socketIoClient) {
      io = _socketIoClient['default'];
    }],
    execute: function () {}
  };
});