# Aurelia BindTable provides cool Aurelia bindings to RethinkDB

Forked from https://github.com/knowthen/BindTable and tweaked to work for Aurelia ;)

The bindings are realtime using [socket.io](https://github.com/Automattic/socket.io). 

BindTable was inspired by [Build Realtime Apps](http://knowthen.com/episode-10-building-realtime-applications-just-got-easy/)

See [Aurelia getting started](https://gist.github.com/kristianmandrup/e1099f54bbb7f6968af7) to get up and running!

### Install

Install global binaries:

`$ npm install -g jspm karma-cli`
`$ jspm init` 

Install module dependencies:

`$ npm install && jspm install`
`$ jspm dl-loader`

### RethinkDB console

You can play around with the RethinkDB tables using the built in web console. To start DB server:

`rethinkdb`

`open http://localhost:8080/#tables`

Add a table and fill in the data. Then test it.

### Running tests

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

To configure a View-Model `Questions` that binds to the RethinkDB table `'question'` via bindtable over socket.io

PS: Here we assume we have a `filters` object, which can be injected and used.

```javascript
import {Bindable} from 'aurelia-bindtable';
import io from 'socket.io-client';
import filters from './filters';

export class Questions extends Bindable {
  constructor(filters) {  
    let socket     = io('localhost');
    this.filters   = filters;
    this.bindTable = BindTable.create({socket: socket});
  }

  tableName: 'questions'

  filter() {
    this.table.bind(this.filters.easy, this.rowLimit);
  }
}
```

That's it!! 

Now you can bind to the variable `rows`.
You can use the variable `table` to directly interact with table methods such as adding or upserting rows etc. 

```
table.delete(record)
table.add(record)
table.update(record) // upsert: ie. insert or update
table.findById(id)
```

You can enable logging by passing `logging: true` to the `BindTable` constructor.

`BindTable.create({socket: socket, logging: true});`

### Server side code

See [Server API](http://socket.io/docs/server-api)

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