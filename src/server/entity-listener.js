import pick from 'lodash/pick';

export default class EntityListener {
  constructor(tableName, options = {}) {
    this.tableName = tableName;
    this.orderBy = options.orderBy || 'createdAt';
    this.io = options.io;
  }

  listen() {
    this.io.on('connection', this.listenTable);
    return this;
  }

  listenTable(socket) {
    this.socket = socket;
    findById();

  }

  findById() {
    socket.on(`${this.tableName}:findById`, (id, cb) => {
      r.table(this.tableName)
        .get(id)
        .run(cb);
    });
  }

  add() {
    this.socket.on('${this.tableName}:add', (record, cb) => {
      record = pick(record, ['name', this.tableName]);
      record.createdAt = new Date();

      r.table(this.tableName)
        .insert(record)
        .run((err, result) => {
          if(err){
            cb(err);
          }
          else{
            record.id = result.generated_keys[0];
            cb(null, record);
          }
        });
    });
  }

  update() {
    this.socket.on('${this.tableName}:update', (record, cb) => {
      record = pick(record, ['id', 'name', this.tableName]);
      r.table(this.tableName)
        .get(record.id)
        .update(record)
        .run(cb);
    });
  }

  delete() {
    this.socket.on(`${this.tableName}:delete`, (id, cb) => {
      r.table(this.tableName)
        .get(id)
        .delete()
        .run(cb);
    });
  }

  start() {
    this.socket.on(`${this.tableName}changes:start`, (data) => {
      let limit, filter;
      limit = data.limit || 100;
      filter = data.filter || {};

      r.table(this.tableName)
        .orderBy({index: r.desc(this.orderBy)})
        .filter(filter)
        .limit(limit)
        .changes()
        .run({cursor: true}, handleChange);

      function handleChange(err, cursor){
        if(err){
          console.log(err);
        }
        else{

          if(cursor){
            cursor.each(function(err, record){
              if(err){
                console.log(err);
              }
              else{
                socket.emit(`${this.tableName}:changes`, record);
              }
            });
          }

        }
        socket.on(`${this.tableName}:changes:stop`, stopCursor);

        socket.on('disconnect', stopCursor);

        function stopCursor () {
          if(cursor){
            cursor.close();
          }
          socket.removeListener(`${this.tableName}:changes:stop`, stopCursor);
          socket.removeListener('disconnect', stopCursor);
        }
      }
    });
  }
}