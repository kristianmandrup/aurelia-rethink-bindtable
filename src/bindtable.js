/*
 * aurelia-bindtable v0.1.0
 * License: MIT
 */

import Record from './record';
import Table  from './table'; 

export function createBindTable (options) {
  new BindTable(options);
}

export class BindTable {
  constructor(options) {
    if(!options || !options.socket){
      throw new Error('must supply a socket io connection');
    }
    this.options      = options;
    BindTable.options = options;
    BindTable.socket  = options.socket;
  }
  
  table(tableName, options) {
    return new Table(tableName, options);
  }

  static create(options) {
    return new BindTable(options);
  }

  static defaultSocket() {
    throw "Please define a static Record defaultSocket function";
  }
}



