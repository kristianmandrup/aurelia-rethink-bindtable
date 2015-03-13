import createPromise from './util';

export default class Record {
  constructor(table, record) {
    this.type = 'Record';
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
          that.upsertLocalRow();
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
          that.upsertLocalRow();
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
      if (idx > -1) {
        console.log('table rows: slice record', idx, table.rows, record);
        table.rows.splice(idx, 0, record);
      }
      else {
        console.log('table rows: push record', table.rows, record);
        if (record === undefined) {
          console.log('WARNING: record not pushed, undefined!');
          return;
        }
        table.rows.push(record);
        console.log('pushed record');
      }
    }
    this.end('upsertLocalRow');
  }

  findIndex (rows, pkName) {
    this.log('findIndex', rows, pkName);
    let record = this.record;
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row === undefined) {
        console.log('WARNING: row', i, 'is undefined for', rows);
        return -1;
      }      
      console.log('find match', rows, row, i, pkName, record)
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
    console.log('rows', table.rows);
    var createdAt;

    if (record === undefined) {
      console.log('record is undefined for', this);
      return idx;
    } else {
      console.log('record', typeof(record), record);
      createdAt = record.createdAt;
      console.log('createdAt', createdAt);
    }

    for (let i = 0; i < table.rows.length; i++) {
      var row = table.rows[i];
      if (row === undefined) {
        continue;
      }
      var rowCreateDate = row[table.sortBy];
      if (rowCreateDate >= createdAt) {
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
