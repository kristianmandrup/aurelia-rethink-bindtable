/*
 * aurelia-bindtable v0.1.0
 * License: MIT
 */

export function createBindTable (options) {
  new BindTable(options);
}

// promise factory
// http://www.html5rocks.com/en/tutorials/es6/promises/
function createPromise(fun) {
  return new Promise(fun);
}

export class BindTable
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

  static defaultSocket() {
    throw "Please define a static Record defaultSocket function";
  }
}

export class Record {
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
    );
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
    if(idx > -1){
      table.rows[idx] = record;
    }
    else{
      idx = findInsertIndex(table, record);
      if(idx > -1){
        table.rows.splice(idx, 0, record);
      }
      else{
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
      if(table.rows[i][table.sortBy] >= record.createdAt){
        idx = i;
        break;
      }
    }
    return idx;
  }
} 

export class Table
  constructor(tableName, options) {
    this.socket = options.socket || BindTable.socket;

    let table = {};
    table.rows = [];
    table.tableName = tableName;

    table.addEventName = options.addEventName 
      || table.tableName + ':add';

    table.findEventName = options.findEventName 
      || table.tableName + ':findById';

    table.updateEventName = options.updateEventName 
      || table.tableName + ':update';

    table.deleteEventName = options.deleteEventName 
      || table.tableName + ':delete';

    table.startChangesEventName = options.startChangesEventName 
      || tableName + ':changes:start';

    table.endChangesEventName = options.endChangesEventName
      || tableName + ':changes:stop';

    table.sortBy = options.sortBy || 'createdAt';

    table.listenEventName = tableName + ':changes';
    table.pkName    = options.pkName || 'id';
    table.add       = this.addRecord(table);
    table.update    = this.updateRecord(table);
    table.findById  = this.findRecordById(table);

    let 
    table.save = (record) => {
      return record.id ? this.update(record) : this.add(record);
    }

    table.delete = this.deleteRecord(table);
    table.bind   = this.bind(table);
    table.unBind = this.unBind(table);

    this.table = table;
    return table;
  }

  on(record) {
    return new Record(this, record);
  }

  update(record){
    return on(record).update();
  }

  add(record){
    return on(record).add();
  }

  deleteRecord(record) {
    return on(record).delete();
  }

  upsertLocalRow(record){
    return on(record).upsertLocalRow();
  }

  findInsertIndex(record){
    return on(record).findInsertIndex(); 
  }

  findById(id) {
    let table = this.table;
    let socket = this.socket;
    var promise = createPromise(function(reject, resolve) {      
      socket.emit(table.findEventName, id, function(err, result){
        if(err){
          reject(err);
        }
        else{
          resolve(result);
        }
      });
    });
    return promise;
  }

  deleteLocalRow(id){
    let table = this.table;
    remove(table.rows, id, table.pkName)
  }

  findIndex (rows, record, pkName) {
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if(row[pkName] === record[pkName]){
        return i;
      }
    };
    return -1;
  } 

  remove (rows, id, pkName) {
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

  updateLocalRows(change){
    let table = this.table;
    if(change.new_val === null){
      deleteLocalRow(table, change.old_val.id);
    }
    else{
      upsertLocalRow(table, change.new_val);
    }
  }

  bind(filter, limit, offset){
    let socket = this.socket;
    var changeOptions = {
      limit: limit || 10,
      offset: offset || 0, 
      filter: filter || {}
    };
    startWatchingChanges(table, changeOptions);
    table.changeHandler = changeHandler(table)
    table.reconnectHandler = reconnect(table, changeOptions);
    socket.on(table.listenEventName, table.changeHandler);
    socket.on('reconnect', table.reconnectHandler);
  }


  reconnect (options){
    let socket = this.socket;
    let table = this.table;
    socket.emit(table.startChangesEventName, options);
  }

  startWatchingChanges(options) {
    let socket = this.socket;
    let table = this.table;
    socket.emit(table.startChangesEventName, options);
  }

  changeHandler (change, cb) {
    updateLocalRows(change)
    if(cb){
      cb(null);
    }
  }

  unBind () {
    let socket = this.socket;    
        let table = this.table;
    socket.emit(table.endChangesEventName);
    socket.removeListener(table.listenEventName, table.changeHandler);
    socket.removeListener('reconnect', table.reconnectHandler);
  }
}
