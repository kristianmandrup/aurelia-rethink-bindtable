import createPromise from './util';

export default class Record {
  constructor(table, record, options = {logging: false}) {
    this.logging = options.logging;
    this.type = 'Record';
    this.table = table;
    this.record = record;
    this.socket = table.socket;
    if (!(this.socket && this.socket.emit))
      this.error('socket not defined')
  }

  update() {
    this.log('update');
    let emitUpdate = (resolve, reject) => {
      this.socket.emit(this.table.updateEventName, this.record, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        this.upsertLocalRow();
        resolve(result);
      });
    };
    return createPromise(emitUpdate);
  }

  add() {
    this.log('add');
    let emitAdd = (resolve, reject) => {
      this.socket.emit(this.table.addEventName, this.record, (err, result) => {
        if (err){
          this.log('rejecting', this.record, err);
          reject(err);
          return;
        }
        this.log('upsert row', this.record);
        this.upsertLocalRow();
        resolve(result);
      });
    };
    return createPromise(emitAdd);
  }

  delete() {
    this.log('delete');
    let emitDelete = (resolve, reject) => {
      this.socket.emit(this.table.deleteEventName, this.record.id, (err, result) => {
        if (err) {
          this.error(err);
          reject(err);
          return;
        }
        this.deleteLocalRow(this.record.id);
        resolve(result);
      });
    };
    return createPromise(emitDelete);
  }

  deleteLocalRow(id){
    this.log('deleteLocalRow', id);
    let table = this.table;
    this.remove(table.rows, id, table.pkName)
  }

  upsertLocalRow() {
    this.log('upsertLocalRow');
    let table = this.table;
    let record = this.record;
    let idx = this.findIndex(table.rows, table.pkName);

    if (idx > -1) {
      table.rows[idx] = record;
    }
    else {
      idx = this.findInsertIndex();
      this.log(`idx ${idx}`);
      if (record === undefined) {
        this.warn('record not upserted: undefined!');
        return;
      }
      if (idx > -1) {
        this.log('table rows: slice record', idx, table.rows, record);
        table.rows.splice(idx, 0, record);
      }
      else {
        this.log('table rows: push record', table.rows, record);
        table.rows.push(record);
      }
    }
  }

  findIndex (rows, pkName) {
    this.log('findIndex', rows, pkName);
    let record = this.record;
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row === undefined) {
        this.warn('row', i, 'is undefined for', rows);
        return -1;
      }
      if (row[pkName] === record[pkName]) {
        return i;
      }
    };
    return -1;
  }

  remove(rows, id, pkName) {
    this.log('remove', rows, id);
    rows = rows || [];
    var length = rows.length;
    for (var i = 0; i < length; i++) {
      var row = rows[i];
      if(row[pkName] === id){
        rows.splice(i, 1);
        length--;
      }
    };
  }

  findInsertIndex() {
    this.log('findInsertIndex');
    let table = this.table;
    let record = this.record;
    let idx = -1;
    var recordCreatedAt;

    if (record === undefined) {
      this.warn('record is undefined for', this);
      return idx;
    } else {
      recordCreatedAt = record.createdAt;
    }

    for (let i = 0; i < table.rows.length; i++) {
      var row = table.rows[i];
      if (row === undefined) {
        continue;
      }
      var rowCreatedDate = row[table.sortBy];
      if (rowCreatedDate >= recordCreatedAt) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  warn(msg) {
    if (this.logging)
      this.log(`[WARNING] ${msg}`);
  }

  error(msg) {
    if (this.logging)
      this.log(`[ERROR] ${msg}`);
      throw `Record: ${msg}`;
  }

  log(msg) {
    if (this.logging)
      console.log('Record:', msg);
  }
}
