import BindTable from './bindtable';
import { inject } from 'aurelia-framework';

export default class Bindable {
  constructor(options = {}) {
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
