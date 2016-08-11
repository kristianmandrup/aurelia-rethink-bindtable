System.register(['./entity-binders', './entity-listener'], function (_export) {
  'use strict';

  return {
    setters: [function (_entityBinders) {
      _export('EntityBinders', _entityBinders['default']);
    }, function (_entityListener) {
      _export('EntityListener', _entityListener['default']);
    }],
    execute: function () {}
  };
});