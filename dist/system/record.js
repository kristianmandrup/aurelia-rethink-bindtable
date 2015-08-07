System.register(['./util'], function (_export) {
  'use strict';

  var createPromise, Record;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_util) {
      createPromise = _util['default'];
    }],
    execute: function () {
      Record = (function () {
        function Record(table, record) {
          var options = arguments.length <= 2 || arguments[2] === undefined ? { logging: false } : arguments[2];

          _classCallCheck(this, Record);

          this.logging = options.logging;
          this.type = 'Record';
          this.table = table;
          this.record = record;
          this.socket = table.socket;
          if (!(this.socket && this.socket.emit)) this.error('socket not defined');
        }

        Record.prototype.update = function update() {
          var _this = this;

          this.log('update');
          var emitUpdate = function emitUpdate(resolve, reject) {
            _this.socket.emit(_this.table.updateEventName, _this.record, function (err, result) {
              if (err) {
                reject(err);
                return;
              }
              _this.upsertLocalRow();
              resolve(result);
            });
          };
          return createPromise(emitUpdate);
        };

        Record.prototype.add = function add() {
          var _this2 = this;

          this.log('add');
          var emitAdd = function emitAdd(resolve, reject) {
            _this2.socket.emit(_this2.table.addEventName, _this2.record, function (err, result) {
              if (err) {
                _this2.log('rejecting', _this2.record, err);
                reject(err);
                return;
              }
              _this2.log('upsert row', _this2.record);
              _this2.upsertLocalRow();
              resolve(result);
            });
          };
          return createPromise(emitAdd);
        };

        Record.prototype['delete'] = function _delete() {
          var _this3 = this;

          this.log('delete');
          var emitDelete = function emitDelete(resolve, reject) {
            _this3.socket.emit(_this3.table.deleteEventName, _this3.record.id, function (err, result) {
              if (err) {
                _this3.error(err);
                reject(err);
                return;
              }
              _this3.deleteLocalRow(_this3.record.id);
              resolve(result);
            });
          };
          return createPromise(emitDelete);
        };

        Record.prototype.deleteLocalRow = function deleteLocalRow(id) {
          this.log('deleteLocalRow', id);
          var table = this.table;
          this.remove(table.rows, id, table.pkName);
        };

        Record.prototype.upsertLocalRow = function upsertLocalRow() {
          this.log('upsertLocalRow');
          var table = this.table;
          var record = this.record;
          var idx = this.findIndex(table.rows, table.pkName);

          if (idx > -1) {
            table.rows[idx] = record;
          } else {
            idx = this.findInsertIndex();
            this.log('idx ' + idx);
            if (record === undefined) {
              this.warn('record not upserted: undefined!');
              return;
            }
            if (idx > -1) {
              this.log('table rows: slice record', idx, table.rows, record);
              table.rows.splice(idx, 0, record);
            } else {
              this.log('table rows: push record', table.rows, record);
              table.rows.push(record);
            }
          }
        };

        Record.prototype.findIndex = function findIndex(rows, pkName) {
          this.log('findIndex', rows, pkName);
          var record = this.record;
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
        };

        Record.prototype.remove = function remove(rows, id, pkName) {
          this.log('remove', rows, id);
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

        Record.prototype.findInsertIndex = function findInsertIndex() {
          this.log('findInsertIndex');
          var table = this.table;
          var record = this.record;
          var idx = -1;
          var recordCreatedAt;

          if (record === undefined) {
            this.warn('record is undefined for', this);
            return idx;
          } else {
            recordCreatedAt = record.createdAt;
          }

          for (var i = 0; i < table.rows.length; i++) {
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
        };

        Record.prototype.warn = function warn(msg) {
          if (this.logging) this.log('[WARNING] ' + msg);
        };

        Record.prototype.error = function error(msg) {
          if (this.logging) this.log('[ERROR] ' + msg);
          throw 'Record: ' + msg;
        };

        Record.prototype.log = function log(msg) {
          if (this.logging) console.log('Record:', msg);
        };

        return Record;
      })();

      _export('default', Record);
    }
  };
});