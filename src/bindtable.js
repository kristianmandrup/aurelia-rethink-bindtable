/*
 * aurelia-bindtable v0.1.0
 * License: MIT
 */

import Record from './record';
import Table  from './table';

export default class BindTable {
  constructor(options = {}) {
    if (!options.socket) {
      throw new Error('must supply a socket io connection');
    }
    options.socket    = options.socket;
    this.options      = options;
    this.type         = 'BindTable';
  }

  table(tableName, options) {
    options = options || this.options;
    options.socket    = options.socket || BindTable.socket;
    return new Table(tableName, options);
  }

  static create(options) {
    return new BindTable(options);
  }
}
