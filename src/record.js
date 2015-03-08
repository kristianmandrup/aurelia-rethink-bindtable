import {createPromise} from './util';

export default class Record {
  constructor(table) {
    this.table = table.table;
    this.socket = table.socket;
  }

  update() {
    let table = this.table;
    let record = this.record;
    let socket = this.socket;
    var promise = createPromise(function(reject, resolve) {      
      socket.emit(table.updateEventName, record, function(err, result){
        if(err){
          reject(err);
        }
        else{
          upsertLocalRow(table, record);
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
    var promise = createPromise(function(reject, resolve) {      
      socket.emit( table.addEventName, record, function(err, record){
        if(err){
          reject(err);
        }
        else{
          upsertLocalRow(table, record);
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
    var promise = createPromise(function(reject, resolve) {      
      socket.emit(table.deleteEventName, record.id, function(err, result){
        if(err){
          reject(err);
        }
        else{
          deleteLocalRow(table, record.id);
          resolve(result);
        }
      });
    });
    return promise;
  }  

  upsertLocalRow() {
    let table = this.table;
    let record = this.record;
    let idx = findIndex(table.rows, record, table.pkName);

    if (idx > -1) {
      table.rows[idx] = record;
    }
    else {
      idx = findInsertIndex(table, record);
      if (idx > -1) {
        table.rows.splice(idx, 0, record);
      }
      else {
        table.rows.push(record);
      }
    }
    return this;
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