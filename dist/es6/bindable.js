import BindTable from './bindtable';
import { inject } from 'aurelia-framework';
import io from 'socket.io-client';

export default class Bindable {
  constructor(options = {}) {
    socket = options.socket || 
             options.socketHost || 
             this.constructor.socket || 
             this.constructor.socketHost;

    if (typeof socket === 'string') {
      socket = io(socket);
    }
    options.socket = socket;

    this.bindTable = BindTable.create(options);
  }

  get tableName() {
    throw "tableName not defined";
  }

  get rowLimit() {
    return 100;
  }

  filter() {
    // calling bind(filter, limit, offset) creates a rows
    // property that is synchronized with changes on the server side
    this.table.bind(null, this.rowLimit);
  }

  activate() {
    this.table = this.bindTable.table(this.tableName);

    this.rows = table.rows;
    this.delete = table.delete;

    this.filter();
  }

  deactivate() {
    this.table.unBind();
  }
}
