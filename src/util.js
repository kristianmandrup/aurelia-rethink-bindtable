// promise factory
// http://www.html5rocks.com/en/tutorials/es6/promises/
export default function createPromise(fun) {
  return new Promise(fun);
}
