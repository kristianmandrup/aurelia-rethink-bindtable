System.register(['lodash/pick'], function (_export) {
  'use strict';

  var pick, server, io, EntityListener;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_lodashPick) {
      pick = _lodashPick['default'];
    }],
    execute: function () {
      server = require('http').createServer();
      io = require('socket.io')(server);

      EntityListener = (function () {
        function EntityListener(tableName) {
          var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          _classCallCheck(this, EntityListener);

          this.tableName = tableName;
          this.orderBy = options.orderBy || 'createdAt';
          this.io = options.io || io;
        }

        EntityListener.prototype.listen = function listen() {
          this.io.on('connection', this.listenTable);
        };

        EntityListener.prototype.listenTable = function listenTable(socket) {
          this.socket = socket;
          findById();
        };

        EntityListener.prototype.findById = function findById() {
          var _this = this;

          socket.on(this.tableName + ':findById', function (id, cb) {
            r.table(_this.tableName).get(id).run(cb);
          });
        };

        EntityListener.prototype.add = function add() {
          var _this2 = this;

          this.socket.on('${this.tableName}:add', function (record, cb) {
            record = pick(record, ['name', _this2.tableName]);
            record.createdAt = new Date();

            r.table(_this2.tableName).insert(record).run(function (err, result) {
              if (err) {
                cb(err);
              } else {
                record.id = result.generated_keys[0];
                cb(null, record);
              }
            });
          });
        };

        EntityListener.prototype.update = function update() {
          var _this3 = this;

          this.socket.on('${this.tableName}:update', function (record, cb) {
            record = pick(record, ['id', 'name', _this3.tableName]);
            r.table(_this3.tableName).get(record.id).update(record).run(cb);
          });
        };

        EntityListener.prototype['delete'] = function _delete() {
          var _this4 = this;

          this.socket.on(this.tableName + ':delete', function (id, cb) {
            r.table(_this4.tableName).get(id)['delete']().run(cb);
          });
        };

        EntityListener.prototype.start = function start() {
          var _this5 = this;

          this.socket.on(this.tableName + 'changes:start', function (data) {
            var limit = undefined,
                filter = undefined;
            limit = data.limit || 100;
            filter = data.filter || {};

            r.table(_this5.tableName).orderBy({ index: r.desc(_this5.orderBy) }).filter(filter).limit(limit).changes().run({ cursor: true }, handleChange);

            function handleChange(err, cursor) {
              if (err) {
                console.log(err);
              } else {

                if (cursor) {
                  cursor.each(function (err, record) {
                    if (err) {
                      console.log(err);
                    } else {
                      socket.emit(this.tableName + ':changes', record);
                    }
                  });
                }
              }
              socket.on(this.tableName + ':changes:stop', stopCursor);

              socket.on('disconnect', stopCursor);

              function stopCursor() {
                if (cursor) {
                  cursor.close();
                }
                socket.removeListener(this.tableName + ':changes:stop', stopCursor);
                socket.removeListener('disconnect', stopCursor);
              }
            }
          });
        };

        return EntityListener;
      })();

      _export('default', EntityListener);
    }
  };
});