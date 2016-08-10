Aurelia BindTable provides cool Aurelia bindings to RethinkDB
=============================================================

Forked from https://github.com/knowthen/BindTable and tweaked to work for Aurelia ;)

The bindings are realtime using [socket.io](https://github.com/Automattic/socket.io).

BindTable was inspired by [Build Realtime Apps](http://knowthen.com/episode-10-building-realtime-applications-just-got-easy/)

### Installation

*Install aurelia-rethinkdb*

```shell
  npm i aurelia-rethinkdb --save
```

*Install RethinkDB*

```shell
  npm i rethinkdb --save
```

Now you're ready to use RethinkDB bindings in your Aurelia application:

### RethinkDB console

You can play around with the RethinkDB tables using the built in web console. To start DB server:

`rethinkdb`

`open http://localhost:8080/#tables`

Add a table and fill in the data. Then test it.

### Running tests

Install Karma CLI

`$ npm install -g jspm karma-cli`

```
$ karma start
WARN [karma]: Port 9876 in use
INFO [karma]: Karma v0.12.31 server started at http://localhost:9877/
INFO [launcher]: Starting browser Chrome
INFO [Chrome 41.0.2272 (Mac OS X 10.10.2)]: Connected on socket cZNHR1B6WAacnOS_3bE5 with id 9608952
..
```

*Trouble shooting*

```
WARN [preprocess]: Can not load "babel", it is not registered!
  Perhaps you are missing some plugin?
```

Install missing plugin:

`npm install karma-babel-preprocessor`

### Binding ViewModels

See [Client API](http://socket.io/docs/client-api/)

Let's configure a View-Model `Questions` that binds to the RethinkDB table `'question'` via bindtable over socket.io

PS: Here we assume we have a `filters` object with filter functions such as `easy`, which can be injected and used.

The main classes to import are:
- `Bindable` a base class for Models or View Models to add binding behavior
- `BindTable` binds directly to a RethinkDB table for realtime sync via socket

```js
import {Bindable, BindTable} from 'aurelia-rethinkdb';
import io from 'socket.io-client';
import filters from './filters';

@inject(filters)
export class Questions extends Bindable {
  tableName = 'questions';

  constructor(filters) {
    super({socket: io('localhost'), logging: true});
    this.filters   = filters;
  }

  filter() {
    this.table.bind(this.filters.easy, this.rowLimit);
  }
}
```

### Bindable

The abstract `Bindable` base class will create an instance variable `rows` (you can bind to) and a `delete(record)` function to delete a record (row) from the table. The rows will be filtered dynamically by the `filter()` method.

```
class Bindable {
  // ...
  activate() {
    this.table = this.bindTable.table(this.tableName);

    this.rows = table.rows;
    this.delete = table.delete;

    this.filter();
  }
}
```

Now bind to the variable `rows`. You can also use the instance variable `table` to directly interact with table methods such as adding or upserting rows etc.

```
this.table.delete(record)
this.table.add(record)
this.table.update(record) // upsert: ie. insert or update
this.table.findById(id)
```

You can enable logging by passing `logging: true` to the `BindTable` constructor.

`BindTable.create({socket: socket, logging: true});`

### Server side code

See [Server API](http://socket.io/docs/server-api)

For now you need to setup your server to listen to specific socket messages and emit messages back. Ideally this code should be refactrored and auto-generated from an entity API generator or similar.

```javascript
io.on('connection', function(socket){
  socket.on('question:findById', function(id, cb){
    r.table('question')
      .get(id)
      .run(cb);
  });

  socket.on('question:add', function(record, cb){
    record = _.pick(record, 'name', 'question');
    record.createdAt = new Date();

    r.table('question')
      .insert(record)
      .run(function(err, result){
        if(err){
          cb(err);
        }
        else{
          record.id = result.generated_keys[0];
          cb(null, record);
        }
      });
  });

  socket.on('question:update', function(record, cb){
    record = _.pick(record, 'id', 'name', 'question');
    r.table('question')
      .get(record.id)
      .update(record)
      .run(cb);
  });

  socket.on('question:delete', function(id, cb){
    r.table('question')
      .get(id)
      .delete()
      .run(cb);
  });

  socket.on('question:changes:start', function(data){

    let limit, filter;
    limit = data.limit || 100;
    filter = data.filter || {};
    r.table('question')
      .orderBy({index: r.desc('createdAt')})
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
              socket.emit('question:changes', record);
            }
          });
        }

      }
      socket.on('question:changes:stop', stopCursor);

      socket.on('disconnect', stopCursor);

      function stopCursor () {
        if(cursor){
          cursor.close();
        }
        socket.removeListener('question:changes:stop', stopCursor);
        socket.removeListener('disconnect', stopCursor);
      }
    }
  });
});
```
