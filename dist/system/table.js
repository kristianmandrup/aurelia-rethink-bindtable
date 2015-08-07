System.register(['./util', './record'], function (_export) {
  'use strict';

  var createPromise, Record, Table;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_util) {
      createPromise = _util['default'];
    }, function (_record) {
      Record = _record['default'];
    }],
    execute: function () {
      Table = (function () {
        function Table(tableName) {
          var _this = this;

          var options = arguments.length <= 1 || arguments[1] === undefined ? { logging: false } : arguments[1];

          _classCallCheck(this, Table);

          this.logging = options.logging;

          this.socket = options.socket;
          if (!(this.socket && this.socket.emit)) {
            console.log(options);
            this.error('socket not defined');
          }

          var table = {};
          table.type = 'table';
          table.rows = [];
          this.type = 'Table';
          table.tableName = tableName;

          table.addEventName = options.addEventName || table.tableName + ':add';

          table.findEventName = options.findEventName || table.tableName + ':findById';

          table.updateEventName = options.updateEventName || table.tableName + ':update';

          table.deleteEventName = options.deleteEventName || table.tableName + ':delete';

          table.startChangesEventName = options.startChangesEventName || tableName + ':changes:start';

          table.endChangesEventName = options.endChangesEventName || tableName + ':changes:stop';

          table.sortBy = options.sortBy || 'createdAt';

          table.listenEventName = tableName + ':changes';
          table.pkName = options.pkName || 'id';

          table.on = this.on;
          table.startWatchingChanges = this.startWatchingChanges;
          table.changeHandler = this.changeHandler;
          table.updateLocalRows = this.updateLocalRows;
          table.upsertLocalRow = this.upsertLocalRow;
          table.reconnect = this.reconnect;

          table.add = this.add;
          table.update = this.update;
          table.findById = this.findById;
          table.log = this.log;
          table.table = table;

          table.save = function (record) {
            return record.id ? _this.update(record) : _this.add(record);
          };

          table['delete'] = this['delete'];
          table.bind = this.bind;
          table.unBind = this.unBind;
          table.socket = this.socket;

          this.table = table;

          return table;
        }

        Table.prototype.on = function on(record) {
          this.log('on');

          return new Record(this, record, this.options);
        };

        Table.prototype.update = function update(record) {
          this.log('update');
          return this.on(record).update();
        };

        Table.prototype.add = function add(record) {
          this.log('add');
          var addPromise = this.on(record).add();
          this.log('adding', addPromise);
          return addPromise;
        };

        Table.prototype['delete'] = function _delete(record) {
          this.log('delete');
          return this.on(record)['delete']();
        };

        Table.prototype.upsertLocalRow = function upsertLocalRow(record) {
          this.log('upsertLocalRow');
          return this.on(record).upsertLocalRow();
        };

        Table.prototype.findInsertIndex = function findInsertIndex(record) {
          this.log('findInsertIndex');
          return this.on(record).findInsertIndex();
        };

        Table.prototype.findById = function findById(id) {
          this.log('findById');
          var table = this.table;
          var socket = this.socket;
          var promise = createPromise(function (reject, resolve) {
            socket.emit(table.findEventName, id, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
          return promise;
        };

        Table.prototype.deleteLocalRow = function deleteLocalRow(id) {
          this.log('deleteLocalRow');
          var table = this.table;
          remove(table.rows, id, table.pkName);
        };

        Table.prototype.findIndex = function findIndex(rows, record, pkName) {
          this.log('findIndex', rows, record, pkName);
          rows = rows || [];
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            if (row[pkName] === record[pkName]) {
              return i;
            }
          };
          return -1;
        };

        Table.prototype.remove = function remove(rows, id, pkName) {
          this.log('remove');
          rows = rows || [];
          var length = rows.length;
          for (var i = 0; i < length; i++) {
            var row = rows[i];
            if (row[pkName] === id) {
              rows.splice(i, 1);
              length--;
            }
          };
        };

        Table.prototype.updateLocalRows = function updateLocalRows(change) {
          this.log('updateLocalRows');
          var table = this.table;

          if (change.new_val === null) {
            this.deleteLocalRow(change.old_val.id);
          } else {
            this.upsertLocalRow(change.new_val);
          }
        };

        Table.prototype.bind = function bind(filter, limit, offset) {
          this.log('bind');
          var socket = this.socket;
          var table = this.table;
          var changeOptions = {
            limit: limit || 10,
            offset: offset || 0,
            filter: filter || {}
          };

          this.startWatchingChanges(changeOptions);

          table.changeHandler = this.changeHandler(table);
          table.reconnectHandler = this.reconnect(changeOptions);

          socket.on(table.listenEventName, table.changeHandler);
          socket.on('reconnect', table.reconnectHandler);
        };

        Table.prototype.reconnect = function reconnect(options) {
          var that = this;
          var socket = this.socket;
          var table = this.table;
          return function () {
            that.log('reconnectHandler');
            socket.emit(table.startChangesEventName, options);
          };
        };

        Table.prototype.startWatchingChanges = function startWatchingChanges(options) {
          var socket = this.socket;
          var table = this.table;
          this.log('startWatchingChanges');
          socket.emit(table.startChangesEventName, options);
        };

        Table.prototype.changeHandler = function changeHandler(table) {
          var that = this;
          return function (change, cb) {
            that.log('changeHandler');
            that.updateLocalRows(change);
            if (cb) {
              cb(null);
            }
          };
        };

        Table.prototype.unBind = function unBind() {
          this.log('unBind');
          var socket = this.socket;
          var table = this.table;
          socket.emit(table.endChangesEventName);
          socket.removeListener(table.listenEventName, table.changeHandler);
          socket.removeListener('reconnect', table.reconnectHandler);
        };

        Table.prototype.warn = function warn(msg) {
          if (this.logging) this.log('[WARNING] ' + msg);
        };

        Table.prototype.error = function error(msg) {
          if (this.logging) this.log('[ERROR] ' + msg);
          throw 'Table: ' + msg;
        };

        Table.prototype.log = function log(msg) {
          if (this.logging) console.log('Table:', msg);
        };

        return Table;
      })();

      _export('default', Table);
    }
  };
});