define(["exports", "module", "./bindtable"], function (exports, module, _bindtable) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _BindTable = _interopRequireDefault(_bindtable);

  var Bindable = (function () {
    Bindable.inject = function inject() {
      return [_BindTable["default"]];
    };

    function Bindable(bindTable, socket) {
      _classCallCheck(this, Bindable);

      this.bindTable = _BindTable["default"].create({ socket: socket });
    }

    Bindable.prototype.filter = function filter() {
      this.table.bind(null, this.rowLimit);
    };

    Bindable.prototype.activate = function activate() {
      this.table = this.bindTable.table(this.tableName);

      this.rows = table.rows;
      this["delete"] = table["delete"];

      this.filter();
    };

    Bindable.prototype.deactivate = function deactivate() {
      this.table.unBind();
    };

    _createClass(Bindable, [{
      key: "tableName",
      get: function get() {
        throw "tableName not defined";
      }
    }, {
      key: "rowLimit",
      get: function get() {
        return 100;
      }
    }]);

    return Bindable;
  })();

  module.exports = Bindable;
});