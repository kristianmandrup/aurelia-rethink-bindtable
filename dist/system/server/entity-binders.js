System.register(['./entity-listener'], function (_export) {
  'use strict';

  var EntityListener, EntityBinders;
  var _bind = Function.prototype.bind;

  _export('default', connect);

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function connect(options) {
    return {
      forTables: function forTables() {
        return new (_bind.apply(EntityBinders, [null].concat([options], tables)))().listen();
      }
    };
  }

  return {
    setters: [function (_entityListener) {
      EntityListener = _entityListener['default'];
    }],
    execute: function () {
      EntityBinders = (function () {
        function EntityBinders(options) {
          _classCallCheck(this, EntityBinders);

          for (var _len = arguments.length, tableNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            tableNames[_key - 1] = arguments[_key];
          }

          this.tableBinders = tableNames.reduce(function (obj, tableName) {
            obj[tableName] = new EntityListener(tableName, options);
            return obj;
          }, {});
        }

        EntityBinders.prototype.named = function named(name) {
          return this.tableBinders[name];
        };

        return EntityBinders;
      })();

      _export('EntityBinders', EntityBinders);
    }
  };
});