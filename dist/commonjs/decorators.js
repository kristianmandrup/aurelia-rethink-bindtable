'use strict';

exports.__esModule = true;
exports.bindable = bindable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bindable = require('./bindable');

var _bindable2 = _interopRequireDefault(_bindable);

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

function bindable(tableName) {
  var socketHost = arguments.length <= 1 || arguments[1] === undefined ? 'localhost' : arguments[1];

  return function (target, key, descriptor) {
    target.tableName = tableName;
    target.inject = (target.inject || []).concat(_bindable2['default']);
    target.socketHost = socketHost;

    Object.defineProperty(target.prototype, 'rows', {
      get: function get() {
        return this.bindable.rows;
      }
    });

    Object.defineProperty(target, 'table', {
      get: function get() {
        return this.bindable.table;
      }
    });
  };
}