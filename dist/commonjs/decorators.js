'use strict';

exports.__esModule = true;
exports.bindable = bindable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bindable = require('./bindable');

var _bindable2 = _interopRequireDefault(_bindable);

function bindable(tableName) {
  return function (target, key, descriptor) {
    target.tableName = tableName;
    target.inject = (target.inject || []).concat(_bindable2['default']);

    Object.defineProperty(target, 'rows', {
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