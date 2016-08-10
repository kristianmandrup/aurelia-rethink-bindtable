System.register(['./record', './table'], function (_export) {
  'use strict';

  var Record, Table, BindTable;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_record) {
      Record = _record['default'];
    }, function (_table) {
      Table = _table['default'];
    }],
    execute: function () {
      BindTable = (function () {
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
          return new Table(tableName, options);
        };

        BindTable.create = function create(options) {
          return new BindTable(options);
        };

        return BindTable;
      })();

      _export('default', BindTable);
    }
  };
});