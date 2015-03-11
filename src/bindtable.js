/*
 * aurelia-bindtable v0.1.0
 * License: MIT
 */

import Record from './record';
import Table  from './table'; 

export function createBindTable(options) {
  return new BindTable(options);
}

export class BindTable {
  constructor(options) {
    if(!options || !options.socket){
      throw new Error('must supply a socket io connection');
    }
    options.socket    = options.socket || BindTable.defaultSocket();
    this.options      = options;
    BindTable.options = options;

    BindTable.socket  = options.socket;
  }
  
  table(tableName, options) {
    options = options || this.options;
    options.socket    = options.socket || BindTable.socket;
    return new Table(tableName, options);
  }

  static create(options) {
    return new BindTable(options);
  }

  static defaultSocket() {
    throw "Please define a static Record defaultSocket function";
  }
}
