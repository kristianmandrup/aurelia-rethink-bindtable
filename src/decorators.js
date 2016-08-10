import Bindable from './bindable';
import io from 'socket.io-client';

export function bindable(tableName, socketHost = 'localhost') {
  return function(target, key, descriptor) {
      target.tableName = tableName;
      target.inject = (target.inject || []).concat(Bindable);
      target.socketHost = socketHost;

      Object.defineProperty(target.prototype, 'rows', {
        get: function() { return this.bindable.rows },
      });

      Object.defineProperty(target, 'table', {
        get: function() { return this.bindable.table },
      });
  }
}