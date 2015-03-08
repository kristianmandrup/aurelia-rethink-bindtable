jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

import {createBindTable} from './aurelia-bindtable';

// import 'co' from 'co-mocha'; 

// TODO: Clean up!
// Enable support for generators in Mocha tests
// function* 
//  yield

describe('bindTable', function(){  
  let mockSocket;      
    
  beforeEach(inject(function(bindTableFactory){
    mockSocket = io.connect();
    bindTable = createBindTable({
      socket: mockSocket 
    });
  }));

  it('should provide an empty array', function(){
    var myTable = bindTable.table('myTable');
    expect(myTable.rows.length).toEqual(0);
  });

  it('should add a record that is returned in promise', function(done){
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 123;
      cb(null, data);
    });
    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
      .then(function(record){
        expect(record.id).toEqual(123);
        done();
      });
    // rootScope.$digest();
  });
  it('should add a record that is in rows array', function (done){
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 123;
      cb(null, data);
    });
    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
      .then(function(record){
        expect(myTable.rows.length).toEqual(1);
        done();
      });
  });

  it('should update an existing record', function (done) {
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 123;
      cb(null, data);
    });
    mockSocket.on('myTable:update', function(data, cb){
      cb(null, data);
    });
    
    var myTable = bindTable('myTable');
    myTable.add({name: 'james'})
      .then(function(record){
        record.name = 'James Moore';
        return myTable.update(record);
      })
      .then(function(updatedRecord){
        expect(updatedRecord.name).toEqual('James Moore');
        done();
      });
  });

  it('should update an existing record in the rows array', function(done){
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 123;
      cb(null, data);
    });
    mockSocket.on('myTable:update', function(data, cb){
      cb(null, data);
    });
    
    var myTable = bindTable('myTable');
    myTable.add({name: 'james'})
      .then(function(record){
        record.name = 'James Moore';
        return myTable.update(record);
      })
      .then(function(updatedRecord){
        expect(myTable.rows[0].name).toEqual('James Moore');
        done();
      });
  });

  it('should not update other records in rows array', function(done){
    var idCounter = 0;
    mockSocket.on('myTable:add', function(data, cb){
      data.id = ++idCounter;
      cb(null, data);
    });
    mockSocket.on('myTable:update', function(data, cb){
      cb(null, data);
    });
    
    var myTable = bindTable('myTable');
    myTable.add({name: 'Bob'})
      .then(function(record){
        return myTable.add({name: 'james'});
      })
      .then(function(record){
        record.name = 'James Moore';
        return myTable.update(record);
      })
      .then(function(updatedRecord){
        expect(myTable.rows[0].name).toEqual('Bob');
        done();
      });
  });

  it('should delete a record', function(done){
    var idCounter = 0;
    mockSocket.on('myTable:add', function(data, cb){
      data.id = ++idCounter;
      cb(null, data);
    });
    mockSocket.on('myTable:delete', function(data, cb){
      cb(null, data);
    });
    var myTable = bindTable('myTable');
    myTable.add({name: 'James'})
      .then(function (record) {
        return myTable.add({name: 'Bob'})
      })
      .then(function(record){
        return myTable.delete(record)
      })
      .then(function(result){
        expect(myTable.rows.length).toEqual(1);
        done();
      });
  });

  it('should update array automatically on outside update', function(done){
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 100;
      cb(null, data);
    });

    var myTable = bindTable('myTable');
    myTable.bind({}, 10, 0);
    myTable.add({name: 'James'})
      .then(function(record){
        var changes = {
          new_val: {
            id: 100,
            name: 'James Moore'
          },
          old_val: {
            id: 100,
            name: 'James'
          }
        };
        mockSocket.emit('myTable:changes', changes, function(err, response){
          expect(myTable.rows[0].name).toEqual('James Moore');
          done();
        })
      });
  });
});
