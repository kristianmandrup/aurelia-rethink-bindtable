import createPromise from './util';
import Record from './record';

//console.log('imported Record', Record);

export default class Table {
  constructor(tableName, options = {}) {
    //console.log('create table', tableName);

    this.socket = options.socket;
    let table = {};
    table.type = 'table';
    table.rows = [];
    this.type = 'Table';
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
    table.startWatchingChanges = this.startWatchingChanges;
    table.changeHandler        = this.changeHandler;
    table.updateLocalRows      = this.updateLocalRows;
    table.upsertLocalRow       = this.upsertLocalRow;
    table.reconnect           = this.reconnect;

    table.add       = this.add;
    table.update    = this.update;
    table.findById  = this.findById;
    table.log       = this.log;
    table.table     = table;

    table.save = (record) => {
      //console.log('Save:', record);
      return record.id ? this.update(record) : this.add(record);
    }

    table.delete = this.delete;
    table.bind   = this.bind;
    table.unBind = this.unBind;
    table.socket = this.socket;

    this.table = table;

    //console.log('table created', this.table);

    return table;
  }

  on(record) {
    this.log('on');
    //console.log('Record', record);
    return new Record(this, record);
  }

  update(record){
    this.log('update');
    return this.on(record).update();
  }

  add(record){
    this.log('add');
    var addPromise = this.on(record).add();
    this.log('adding', addPromise);
    return addPromise;
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
    this.log('findIndex', rows, record, pkName);
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      //console.log('find match', row, i, pkName, record)
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
    //console.log('change', change);

    if(change.new_val === null){
      //console.log('deleting', change.old_val.id);
      this.deleteLocalRow(change.old_val.id);
    }
    else{
      //console.log('upserting', change.new_val);
      this.upsertLocalRow(change.new_val);
    }
  }

  bind(filter, limit, offset){
    this.log('bind');
    let socket        = this.socket;
    let table         = this.table;
    var changeOptions = {
      limit: limit || 10,
      offset: offset || 0,
      filter: filter || {}
    };
    //console.log('this', this);
    //console.log('table', table);
    //console.log('startWatchingChanges', this.startWatchingChanges);

    this.startWatchingChanges(changeOptions);

    table.changeHandler = this.changeHandler(table);
    table.reconnectHandler = this.reconnect(changeOptions);

    socket.on(table.listenEventName, table.changeHandler);
    socket.on('reconnect', table.reconnectHandler);
  }


  reconnect(options){
    var that = this;
    let socket = this.socket;
    let table = this.table;
    return function() {
      that.log('reconnectHandler');
      socket.emit(table.startChangesEventName, options);
    }
  }

  startWatchingChanges(options) {
    let socket = this.socket;
    let table = this.table;
    this.log('startWatchingChanges');
    socket.emit(table.startChangesEventName, options);
  }

  changeHandler(table) {
    var that = this;
    return function(change, cb) {
      that.log('changeHandler');
      that.updateLocalRows(change)
      if(cb){
        cb(null);
      }
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
