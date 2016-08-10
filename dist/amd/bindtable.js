define(['exports', 'module', './record', './table'], function (exports, module, _record, _table) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _Record = _interopRequireDefault(_record);

  var _Table = _interopRequireDefault(_table);

  var BindTable = (function () {
    function BindTable() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, BindTable);

      if (!options.socket) {
        throw new Error('You must supply a socket io connection');
      }
      this.socket = options.socket;
      this.options = options;
      this.type = 'BindTable';
    }

    BindTable.prototype.table = function table(tableName) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options.socket = options.socket || this.socket;
      return new _Table['default'](tableName, options);
    };

    BindTable.create = function create(options) {
      return new BindTable(options);
    };

    return BindTable;
  })();

  module.exports = BindTable;
});