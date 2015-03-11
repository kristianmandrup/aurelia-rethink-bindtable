import createPromise from './util';

export default class Record {
  constructor(table, record) {
    this.table = table;
    this.record = record;
    this.socket = table.socket;
  }

  update() {
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(reject, resolve) {      
      socket.emit(table.updateEventName, record, function(err, result){
        if(err){
          reject(err);
        }
        else{
          that.upsertLocalRow(table, record);
          resolve(result);
        }
      });      
    });
    return promise;
  }

  add() {
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(reject, resolve) {      
      socket.emit( table.addEventName, record, function(err, record){
        if(err){
          reject(err);
        }
        else{
          that.upsertLocalRow(table, record);
          resolve(record);
        }
      });
    });
    return promise;
  }  

  delete() {    
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    let that   = this;
    var promise = createPromise(function(reject, resolve) {      
      socket.emit(table.deleteEventName, record.id, function(err, result){
        if(err){
          reject(err);
        }
        else{
          that.deleteLocalRow(table, record.id);
          resolve(result);
        }
      });
    });
    return promise;
  }  

  upsertLocalRow() {
    let table = this.table;
    let record = this.record;

    // TODO: fix
    let idx = this.findIndex(table.rows, table.pkName);

    if (idx > -1) {
      table.rows[idx] = record;
    }
    else {
      idx = this.findInsertIndex(table, record);
      if (idx > -1) {
        table.rows.splice(idx, 0, record);
      }
      else {
        table.rows.push(record);
      }
    }
    return this;
  }

  findIndex (rows, pkName) {
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if(row[pkName] === this.record[pkName]){
        return i;
      }
    };
    return -1;
  } 

  findInsertIndex() {
    let table = this.table;
    let record = this.record;
    let idx = -1;
    for (let i = 0; i < table.rows.length; i++) {
      if (table.rows[i][table.sortBy] >= record.createdAt) {
        idx = i;
        break;
      }
    }
    return idx;
  }
} 