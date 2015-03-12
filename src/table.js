import createPromise from './util';
import Record from './record';

console.log('imported Record', Record);

export default class Table {
  constructor(tableName, options) {
    console.log('create table', tableName);

    this.socket = options.socket;
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

    table.on        = this.on;
    table.add       = this.add;
    table.update    = this.update;
    table.findById  = this.findById;
    table.log       = this.log; 

    table.save = (record) => {
      return record.id ? this.update(record) : this.add(record);
    }

    table.delete = this.delete;
    table.bind   = this.bind;
    table.unBind = this.unBind;
    table.socket = this.socket;

    this.table = table;

    console.log('table created');

    return table;
  }

  on(record) {
    console.log('table.on', this)
    this.log('on');
    console.log('Record', record);
    return new Record(this, record);
  }

  update(record){
    this.log('update');
    return this.on(record).update();
  }

  add(record){
    this.log('add');
    var rec = this.on(record);
    console.log('rec', rec)
    return rec.add();
  }

  delete(record) {
    this.log('delete');
    return this.on(record).delete();
  }

  upsertLocalRow(record){
    this.log('upsertLocalRow');
    return this.on(record).upsertLocalRow();
  }

  findInsertIndex(record){
    this.log('findInsertIndex');
    return this.on(record).findInsertIndex(); 
  }

  findById(id) {
    this.log('findById');
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
    this.log('deleteLocalRow');
    let table = this.table;
    remove(table.rows, id, table.pkName)
  }

  findIndex(rows, record, pkName) {
    this.log('findIndex');
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if(row[pkName] === record[pkName]){
        return i;
      }
    };
    return -1;
  } 

  remove(rows, id, pkName) {
    this.log('remove');
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
    this.log('updateLocalRows');
    let table = this.table;
    if(change.new_val === null){
      deleteLocalRow(table, change.old_val.id);
    }
    else{
      upsertLocalRow(table, change.new_val);
    }
  }

  bind(filter, limit, offset){
    this.log('bind');
    let socket        = this.socket;
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


  reconnect(options){
    this.log('reconnect');
    let socket = this.socket;
    let table  = this.table;
    socket.emit(table.startChangesEventName, options);
  }

  startWatchingChanges(options) {
    this.log('startWatchingChanges');
    let socket = this.socket;
    let table = this.table;
    socket.emit(table.startChangesEventName, options);
  }

  changeHandler(change, cb) {
    this.log('changeHandler');
    updateLocalRows(change)
    if(cb){
      cb(null);
    }
  }

  unBind() {
    this.log('unBind');
    let socket = this.socket;    
    let table = this.table;
    socket.emit(table.endChangesEventName);
    socket.removeListener(table.listenEventName, table.changeHandler);
    socket.removeListener('reconnect', table.reconnectHandler);
  }

  log(msg) {
    console.log('Table:', msg);
  }

}
