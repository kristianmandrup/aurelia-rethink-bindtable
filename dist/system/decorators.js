System.register(['./bindable'], function (_export) {
  'use strict';

  var Bindable;

  _export('bindable', bindable);

  function bindable(tableName) {
    return function (target, key, descriptor) {
      target.tableName = tableName;
      target.inject = (target.inject || []).concat(Bindable);

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

  return {
    setters: [function (_bindable) {
      Bindable = _bindable['default'];
    }],
    execute: function () {}
  };
});