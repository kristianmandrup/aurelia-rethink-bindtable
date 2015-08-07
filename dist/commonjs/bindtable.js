'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

var _table = require('./table');

var _table2 = _interopRequireDefault(_table);

var BindTable = (function () {
  function BindTable() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, BindTable);

    if (!options.socket) {
      throw new Error('must supply a socket io connection');
    }
    this.socket = options.socket;
    this.options = options;
    this.type = 'BindTable';
  }

  BindTable.prototype.table = function table(tableName) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    options.socket = options.socket || this.socket;
    return new _table2['default'](tableName, options);
  };

  BindTable.create = function create(options) {
    return new BindTable(options);
  };

  return BindTable;
})();

exports['default'] = BindTable;
module.exports = exports['default'];