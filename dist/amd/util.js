define(["exports", "module"], function (exports, module) {
  "use strict";

  module.exports = createPromise;

  function createPromise(fun) {
    return new Promise(fun);
  }
});