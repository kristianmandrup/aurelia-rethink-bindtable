define(['exports', 'module', './bindtable', 'aurelia-framework', 'socket.io-client'], function (exports, module, _bindtable, _aureliaFramework, _socketIoClient) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _BindTable = _interopRequireDefault(_bindtable);

  var _io = _interopRequireDefault(_socketIoClient);

  var Bindable = (function () {
    function Bindable() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Bindable);

      this.configure(options);
    }

    Bindable.prototype.configure = function configure() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      socket = options.socket || options.socketHost || this.constructor.socket || this.constructor.socketHost;

      if (typeof socket === 'string') {
        socket = _io['default'](socket);
      }
      options.socket = socket;

      this.bindTable = _BindTable['default'].create(options);
      return this;
    };

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

  module.exports = Bindable;
});