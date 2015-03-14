var createMockSocketObject = function(options = {logging: false}) {
  return {
    logging: options.logging,
    log: function (msg) {
      if (this.logging)
        console.log('Socket:', msg);
    },
    on: function (ev, fn) {
      (this._listeners[ev] = this._listeners[ev] || []).push(fn);
    },
    once: function (ev, fn) {
      (this._listeners[ev] = this._listeners[ev] || []).push(fn);
      fn._once = true;
    },
    emit: function (ev, data) {
      this.log('emit:', ev);
      if (this._listeners[ev]) {
        var args = arguments;
        this._listeners[ev].forEach(function (listener) {
          if (listener._once) {
            this.removeListener(ev, listener);
          }
          listener.apply(null, Array.prototype.slice.call(args, 1));
        }.bind(this));
      }
    },
    _listeners: {},
    removeListener: function (ev, fn) {
      this.log(`removeListener: ${ev}`);
      if (fn) {
        var index = this._listeners[ev].indexOf(fn);
        if (index > -1) {
          this._listeners[ev].splice(index, 1);
        }
      } else {
        delete this._listeners[ev];
      }
    },
    removeAllListeners: function (ev) {
      this.log(`removeAllListeners: ${ev}`);
      if (ev) {
        delete this._listeners[ev];
      } else {
        this._listeners = {};
      }
    },
    disconnect: function () {},
    connect: function () {}
  };
}

var io = {
  connect: createMockSocketObject
};

export default io;
