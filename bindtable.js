/*
 * @license bindtable v0.1.0
 * (c) 2015 James Moore http://knowthen.com
 * License: MIT
 */

export function bindTable (options) {
  new BindTable(options);
}

export class BindTable
  constructor(options) {
    if(!options || !options.socket){
      throw new Error('must supply a socket io connection');
    }
    this.socket = options.socket;
  }
  
  createTable(tableName) {
    var table = {};
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
    table.pkName = options.pkName || 'id';
    table.add = addRecord(table, $q, socket);
    table.update = updateRecord(table, $q, socket);
    table.findById = findRecordById(table, $q, socket);
    table.save = function(record){
      if(record.id){
        return this.update(record);
      }
      else{
        return this.add(record);
      }
    }
    table.delete = deleteRecord(table, $q, socket);
    table.bind = bind(table, $q, socket);
    table.unBind = unBind(table, $q, socket);

    this.table = table;
    return table;
  }
}

function promise() {
  return new Promise();
}

class Record {
  constructor(table, socket) {
    this.table = table;
    this.socket = socket;
  }

  add(record) {
    var deffered = createPromise();

    socket.emit( table.addEventName, record, function(err, record){
      if(err){
        promise.reject(err);
      }
      else{
        upsertLocalRow(table, record);
        promise.resolve(record);
      }
    });
    return promise;
  }

  update(record){
    var promise = createPromise();
    socket.emit(table.updateEventName, record, function(err, result){
      if(err){
        promise.reject(err);
      }
      else{
        upsertLocalRow(table, record);
        promise.resolve(result);
      }
    });
    return promise;
  }

  findById(id) {
    var promise = createPromise();
    socket.emit(table.findEventName, id, function(err, result){
      if(err){
        deffered.reject(err);
      }
      else{
        deffered.resolve(result);
      }
    });
    return deffered;
  }


  deleteRecord(record) {
    var promise = createPromise();
    socket.emit(table.deleteEventName, record.id, function(err, result){
      if(err){
        promise.reject(err);
      }
      else{
        deleteLocalRow(table, record.id);
        promise.resolve(result);
      }
    });
    return promise;
  }


  upsertLocalRow(record){
    var idx = findIndex(table.rows, record, table.pkName);
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

  findInsertIndex(record){
    var idx = -1;
    for (var i = 0; i < table.rows.length; i++) {
      if(table.rows[i][table.sortBy] >= record.createdAt){
        idx = i;
        break;
      }
    }
    return idx;
  }

  deleteLocalRow(id){
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
    if(change.new_val === null){
      deleteLocalRow(table, change.old_val.id);
    }
    else{
      upsertLocalRow(table, change.new_val);
    }
  }

  bind(filter, limit, offset){
    var changeOptions = {
      limit: limit || 10,
      offset: offset || 0, 
      filter: filter || {}
    };
    startWatchingChanges(table, socket, changeOptions);
    table.changeHandler = changeHandler(table)
    table.reconnectHandler = reconnect(table, socket, changeOptions);
    socket.on(table.listenEventName, table.changeHandler);
    socket.on('reconnect', table.reconnectHandler);
  }


  reconnect (options){
    return function () {
      socket.emit(table.startChangesEventName, options);
    }
  }

  startWatchingChanges (options) {
    socket.emit(table.startChangesEventName, options);
  }

  changeHandler (change, cb) {
    updateLocalRows(table, change)
    if(cb){
      cb(null);
    }
  }

  unBind () {
    socket.emit(table.endChangesEventName);
    socket.removeListener(table.listenEventName, table.changeHandler);
    socket.removeListener('reconnect', table.reconnectHandler);
  }
}
