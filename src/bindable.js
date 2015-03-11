import {BindTable, createBindTable} from './bindtable';

export class Bindable {
  static inject() { return [BindTable]; }

  constructor(bindTable, socket) {  
    this.bindTable = createBindTable({socket:socket});
    super();
  }

  get tableName() {   
    throw "tableName not defined";
  }

  get rowLimit() {   
    100
  }  

  filter() {
    // calling bind(filter, limit, offset) creates a rows
    // property that is synchronized with changes on the server side
    this.table.bind(null, this.rowLimit);
  }

  activate() {
    this.table = bindTable(this.tableName);

    this.rows = table.rows;
    this.delete = table.delete;

    this.filter();
  }

  deactivate() {
    table.unBind();
  }    
}
