# Aurelia BindTable provides cool Aurelia bindings to RethinkDB

Forked from https://github.com/knowthen/BindTable and tweaked to work for Aurelia ;)

See https://gitter.im/Aurelia/Discuss?at=54e1f6efcfb73e3306d3d87e

Example config in Aurelia

First add the plugin `'aurelia-bindtable'` in `main.js`

```javascript
export function configure(aurelia) {
  aurelia.use
  ...
  .plugin('aurelia-bindtable')
```

Then create the BindTable configurator


```
import {io} from 'socket.io-client';
import {bindTableFactory} from 'aurelia-bindtable';

export class BindTable
  static inject() { return [bindTableFactory]; }
  
  constructor(bindTableFactory){
    this.socket = io('http://localhost');
    this.instance = bindTableFactory({socket: this.socket});
  }
});
```

`aurelia-bindtable` exports the function `bindTableFactory` which is injected.

```
export function bindTableFactory (options) {
  ...
}
```



Now create a ViewModel `Questions` that binds to the table `'question'` via bindtable ;)

This can be further optimized by having the common bindtable logic in a separate subclass or module for inclusion in multiple table bindable ViewModel classes.

```javascript
import {BindTable} from 'aurelia-bindtable';

export class Questions {

export class Member {
  static inject() { return [BindTable]; }

  constructor(bindTable) {  
    this.bindTable = bindTable;
  }

  activate() {
    this.questionTable = bindTable('question');
    // calling bind(filter, limit, offset) creates a rows
    // property that is synchronized with changes on the server side
    this.questionTable.bind(null, 100);

    this.questions = questionTable.rows;
    this.delete = questionTable.delete;

  deactivate() {
    questionTable.unBind();
  }    
}
```

That's it!!

### Server side code
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