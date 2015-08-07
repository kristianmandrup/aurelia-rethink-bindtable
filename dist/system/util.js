System.register([], function (_export) {
  "use strict";

  _export("default", createPromise);

  function createPromise(fun) {
    return new Promise(fun);
  }

  return {
    setters: [],
    execute: function () {}
  };
});