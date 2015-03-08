// promise factory
// http://www.html5rocks.com/en/tutorials/es6/promises/
export function createPromise(fun) {
  return new Promise(fun);
}
