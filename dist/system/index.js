System.register(['./bindable', './bindtable', './decorators'], function (_export) {
  'use strict';

  return {
    setters: [function (_bindable) {
      for (var _key in _bindable) {
        if (_key !== 'default') _export(_key, _bindable[_key]);
      }
    }, function (_bindtable) {
      for (var _key2 in _bindtable) {
        if (_key2 !== 'default') _export(_key2, _bindtable[_key2]);
      }
    }, function (_decorators) {
      for (var _key3 in _decorators) {
        if (_key3 !== 'default') _export(_key3, _decorators[_key3]);
      }
    }],
    execute: function () {}
  };
});