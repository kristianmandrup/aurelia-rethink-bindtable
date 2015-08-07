System.register(['./bindable', './bindtable'], function (_export) {
  'use strict';

  _export('configure', configure);

  function configure(aurelia) {}

  return {
    setters: [function (_bindable) {
      for (var _key in _bindable) {
        if (_key !== 'default') _export(_key, _bindable[_key]);
      }
    }, function (_bindtable) {
      for (var _key2 in _bindtable) {
        if (_key2 !== 'default') _export(_key2, _bindtable[_key2]);
      }
    }],
    execute: function () {}
  };
});