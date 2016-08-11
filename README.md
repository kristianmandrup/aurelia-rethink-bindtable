Aurelia BindTable provides cool Aurelia bindings to RethinkDB
=============================================================

Forked from [BindTable](https://github.com/knowthen/BindTable) and tweaked to work for Aurelia ;)

The bindings are realtime using [socket.io](https://github.com/Automattic/socket.io).

BindTable was inspired by [Build Realtime Apps](http://knowthen.com/episode-10-building-realtime-applications-just-got-easy/)

### Installation

*Install aurelia-rethink-bindtable*

```shell
  npm i aurelia-rethink-bindtable --save
```

*Install RethinkDB*

```shell
  npm i rethinkdb --save
```

Now you're ready to use RethinkDB bindings in your Aurelia application:

### Distributed modules

The `/dist` folder contains built code for `amd`, `commonjs`, `es6` and `system`. Choose the one that best fits your module system.

### npm and ES6

By default the ES6 distribution is linked to the `main` entry of the `package.json` file.

`import {Bindable} from 'aurelia-rethink-bindtable';`

### JSPM (SystemJs) and Amd

For JSPM the `amd` distribution is used by default (see `jspm` section of `package.json`)

```json
  "jspm": {
    "main": "dist/amd/index",
    "format": "amd",
    "directories": {
      "lib": "dist/amd"
    ...    
    }
  }
```

### Custom distribution loading

Commonjs example:

`var Bindable = require('aurelia-rethink-bindtable/dist/commonjs').Bindable;`

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

Let's configure a View-Model `Questions` that binds to the RethinkDB table `'question'` via bindtable over *socket.io*

The main classes to import are:
- `Bindable` a base class for Models or View Models to add binding behavior
- `BindTable` binds directly to a RethinkDB table for realtime sync via socket

```js
import {Bindable, BindTable} from 'aurelia-rethink-bindtable';
import io from 'socket.io-client';
import Filters from './filters';

@inject(Filters)
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

We assume we have a `Filters` class with filter functions such as `easy`, which can be injected as a singleton.

```js
export default class QuestionFilters {
  easy(item) {
    return item.level === 'easy';
  }

  // more filter methods...
}
```

Better to inject `Bindable` than use inheritance!

```js
import {Bindable} from 'aurelia-rethink-bindtable';
import io from 'socket.io-client';
import Filters from './filters';

@inject(Bindable, Filters)
export class Questions {
  tableName = 'questions';

  constructor(bindable, filters) {
    super({socket: io('localhost'), logging: true});
    this.filters   = filters;
    this.bound = bindable;
  }

  filter() {
    this.table.bind(this.filters.easy, this.rowLimit);
  }

  get rows() {
    return this.bound.rows;
  }

  get table() {
    return this.bound.table;
  }
}
```

We could combine this with an ES6 compatible `mixin` approach or use a custom `@bindable([table name], [socket addr])` class decorator ;) 

See [here](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.m6vp42acx) on how to write such a decorator!

```js
import {bindable} from 'aurelia-rethink-bindtable';
import io from 'socket.io-client';
import Filters from './filters';

@inject(Filters)
@bindable('questions', 'localhost')
export class Questions {
  constructor(bindable, filters) {
    this.filters  = filters;
    this.bound = bindable.configure({logging: true, socketHost: this.socketHost });
  }

  filter() {
    this.table.bind(this.filters.easy, this.rowLimit);
  }
}
```

### Bindable

The `Bindable` class will create an instance variable `rows` (you can bind to) and a `delete(record)` function to delete a record (row) from the table. The rows will be filtered dynamically by the `filter()` method.

```
class Bindable {
  // ...
  get tableName() {
    throw "tableName not defined";
  }

  get rowLimit() {
    return 100;
  }

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

### Development and contributions

Would be awesome to make this a plugin (if it makes sense), perhaps by making `Bindable` a registered singleton for injection so we use composition over inheritance!

See [Skeleton plugin](https://github.com/aurelia/skeleton-plugin) and [making our first plugin](http://patrickwalters.net/making-out-first-plugin/)

Would also be nice to create server side API generators for the entity/socket code (see below).

`npm i` - to install dependencies

`gulp build` - to build distribution

See `/build/tasks` for all gulp tasks supported ;)

`npm link` to link this module while developing. Add more tests in `spec` and run using karma via `gulp test`.

### Server side code

You need to setup your server to listen to specific socket messages and emit messages back!

You can experiment with the new `server/entity-listener` class which you can use as follows:

```js
const server = require('http').createServer();
const io = require('socket.io')(server);

questionListener = new EntityListener('question', {
  orderBy: 'createdAt',
  io: io // to override default socket.io (toptional)
}).listen();
```

The `EntityListener` essentially wraps the code below (currently untested!).

The following Server code example for the `question` table is taken directly from the original [BindTable](https://github.com/knowthen/BindTable) example

See [Socket Server API](http://socket.io/docs/server-api) for more details.

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
