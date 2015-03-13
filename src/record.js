import createPromise from './util';

export default class Record {
  constructor(table, record) {
    this.table = table;
    this.record = record;
    this.socket = table.socket;
  }

  update() {
    this.log('update');
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(resolve, reject) {      
      socket.emit(table.updateEventName, record, function(err, result) {
        if (err){
          reject(err);
        }
        else {
          that.upsertLocalRow(table, record);
          resolve(result);
        }
      });
    });
    return promise;
  }

  add() {
    this.log('add');
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(resolve, reject) {
      socket.emit( table.addEventName, record, function(err, record) {
        if (err){
          console.log('rejecting', record, err);
          reject(err);
        }
        else {
          console.log('upsert row', record);
          that.upsertLocalRow(table, record);
          console.log('resolving', record);
          resolve(record);
        }
      });
    });

    console.log('returning promise', promise);
    return promise;
  }

  delete() {
    this.log('delete');
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(resolve, reject) {
      socket.emit(table.deleteEventName, record.id, function(err, result){
        if(err) {
          this.error(err);
          reject(err);
        }
        else {
          that.deleteLocalRow(record.id);
          resolve(result);
        }
      });
    });
    return promise;
  }

  deleteLocalRow(id){
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
      idx = this.findInsertIndex(table, record);
      this.log(`idx ${idx}`);
      if (idx > -1) {
        console.log('table rows: slice record', idx, table.rows, record);
        table.rows.splice(idx, 0, record);
      }
      else {
        console.log('table rows: push record', table.rows, record);
        table.rows.push(record);
        console.log('pushed record');
      }
    }
    this.end('upsertLocalRow');
  }

  findIndex (rows, pkName) {
    this.log('findIndex', rows, pkName);
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row[pkName] === this.record[pkName]) {
        return i;
      }
    };
    return -1;
  }

  remove(rows, id, pkName) {
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
    console.log('table', table, record);
    console.log('rows', table.rows.length);

    for (let i = 0; i < table.rows.length; i++) {
      if (table.rows[i][table.sortBy] >= record.createdAt) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  error(msg) {
    console.log('Record: error - ', msg);
  }

  end(msg) {
    console.log('end', msg);
  }

  log(msg) {
    console.log('Record:', msg);
  }
}
