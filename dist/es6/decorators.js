import Bindable from './bindable';

export function bindable(tableName) {
  return function(target, key, descriptor) {
      target.tableName = tableName;
      target.inject = (target.inject || []).concat(Bindable);

      Object.defineProperty(target, 'rows', {
        get: function() { return this.bindable.rows },
      });

      Object.defineProperty(target, 'table', {
        get: function() { return this.bindable.table },
      });
  }
}