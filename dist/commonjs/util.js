"use strict";

exports.__esModule = true;
exports["default"] = createPromise;

function createPromise(fun) {
  return new Promise(fun);
}

module.exports = exports["default"];