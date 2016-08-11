import Bindable from './bindable';
import io from 'socket.io-client';

export function bindable(tableName, socketHost = 'localhost') {
  return function(target, key, descriptor) {
      target.tableName = tableName;
      target.socketHost = socketHost;

      Object.defineProperty(target.prototype, 'rows', {
        get: function() { return this.bound.rows },
      });

      Object.defineProperty(target, 'table', {
        get: function() { return this.bound.table },
      });
  }
}