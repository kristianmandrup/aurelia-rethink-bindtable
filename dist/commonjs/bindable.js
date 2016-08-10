'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bindtable = require('./bindtable');

var _bindtable2 = _interopRequireDefault(_bindtable);

var _aureliaFramework = require('aurelia-framework');

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var Bindable = (function () {
  function Bindable() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Bindable);

    socket = options.socket || options.socketHost || this.constructor.socket || this.constructor.socketHost;

    if (typeof socket === 'string') {
      socket = _socketIoClient2['default'](socket);
    }
    options.socket = socket;

    this.bindTable = _bindtable2['default'].create(options);
  }

  Bindable.prototype.filter = function filter() {
    this.table.bind(null, this.rowLimit);
  };

  Bindable.prototype.activate = function activate() {
    this.table = this.bindTable.table(this.tableName);

    this.rows = table.rows;
    this['delete'] = table['delete'];

    this.filter();
  };

  Bindable.prototype.deactivate = function deactivate() {
    this.table.unBind();
  };

  _createClass(Bindable, [{
    key: 'tableName',
    get: function get() {
      throw "tableName not defined";
    }
  }, {
    key: 'rowLimit',
    get: function get() {
      return 100;
    }
  }]);

  return Bindable;
})();

exports['default'] = Bindable;
module.exports = exports['default'];