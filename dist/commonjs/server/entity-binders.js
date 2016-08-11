'use strict';

exports.__esModule = true;
var _bind = Function.prototype.bind;
exports['default'] = connect;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _entityListener = require('./entity-listener');

var _entityListener2 = _interopRequireDefault(_entityListener);

var EntityBinders = (function () {
  function EntityBinders(options) {
    _classCallCheck(this, EntityBinders);

    for (var _len = arguments.length, tableNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      tableNames[_key - 1] = arguments[_key];
    }

    this.tableBinders = tableNames.reduce(function (obj, tableName) {
      obj[tableName] = new _entityListener2['default'](tableName, options);
      return obj;
    }, {});
  }

  EntityBinders.prototype.named = function named(name) {
    return this.tableBinders[name];
  };

  return EntityBinders;
})();

exports.EntityBinders = EntityBinders;

function connect(options) {
  return {
    forTables: function forTables() {
      return new (_bind.apply(EntityBinders, [null].concat([options], tables)))().listen();
    }
  };
}