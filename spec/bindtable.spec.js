jasmine.DEFAULT_TIMEOUT_INTERVAL = 1500;

import {BindTable, createBindTable} from '../src/bindtable';
import io from '../mock/socket-io';

console.log('IO', io);
console.log('BindTable', BindTable);
console.log('createBindTable', createBindTable);

// // import 'co' from 'co-mocha';

// TODO: Clean up!
// Enable support for generators in Mocha tests
// function*
//   yield

// Jasmine
// http://jasmine.github.io/2.2/introduction.html
// http://jasmine.github.io/2.2/introduction.html#section-Asynchronous_Support


// http://www.html5rocks.com/en/tutorials/es6/promises/
describe('Promise', function(){
  it('resolve should resolve', function(done){
    var promise = new Promise(function(resolve, reject) {
      resolve('ok');
    });
    // return promise;
    promise.then(function(res) {
      expect(res).toEqual('ok')
      done();
    })
  });

  it('reject should reject', function(done){
    var promise = new Promise(function(resolve, reject) {
      reject('err');
    });
    // return promise;
    promise.then(function(res) {
      done();
    }, function(err) {
      expect(err).toEqual('err')
      done();
    })
  });
});

describe('bindTable', function(){
  var mockSocket;
  var bindTable;

  beforeEach(function(done) {
    console.log('io in before each', io);
    console.log('BindTable in before each', BindTable);

    mockSocket = io.connect();
    console.log('mockSocket', mockSocket);

    bindTable = createBindTable({
      socket: mockSocket
    });

    console.log('bindTable', bindTable);
    done();
  });

  it('should add a record that is returned in promise', function(done){
    mockSocket.on('myTable:add', function(data, cb){
      data.id = 123;
      cb(null, data);
    });
    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
      .then(function(record){
        console.log('added', record);
        expect(record.id).toEqual(123);
        done();
      });
  });



  // it('should add a record that is returned in promise', function(done){
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = 123;
  //     cb(null, data);
  //   });
  //   var myTable = bindTable.table('myTable');
  //   myTable.add({name: 'james'})
  //     .then(function(record){
  //       console.log('added', record);
  //       expect(record.id).toEqual(123);
  //       done();
  //     });
  // });

  // it('should add a record that is in rows array', function (done){
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = 123;
  //     cb(null, data);
  //   });
  //   var myTable = bindTable.table('myTable');
  //   myTable.add({name: 'james'})
  //     .then(function(record){
  //       expect(myTable.rows.length).toEqual(1);
  //       done();
  //     });
  // });

  // it('should update an existing record', function (done) {
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = 123;
  //     cb(null, data);
  //   });
  //   mockSocket.on('myTable:update', function(data, cb){
  //     cb(null, data);
  //   });

  //   var myTable = bindTable('myTable');
  //   myTable.add({name: 'james'})
  //     .then(function(record){
  //       record.name = 'James Moore';
  //       return myTable.update(record);
  //     })
  //     .then(function(updatedRecord){
  //       expect(updatedRecord.name).toEqual('James Moore');
  //       done();
  //     });
  // });

  // it('should update an existing record in the rows array', function(done){
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = 123;
  //     cb(null, data);
  //   });
  //   mockSocket.on('myTable:update', function(data, cb){
  //     cb(null, data);
  //   });

  //   var myTable = bindTable('myTable');
  //   myTable.add({name: 'james'})
  //     .then(function(record){
  //       record.name = 'James Moore';
  //       return myTable.update(record);
  //     })
  //     .then(function(updatedRecord){
  //       expect(myTable.rows[0].name).toEqual('James Moore');
  //       done();
  //     });
  // });

  // it('should not update other records in rows array', function(done){
  //   var idCounter = 0;
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = ++idCounter;
  //     cb(null, data);
  //   });
  //   mockSocket.on('myTable:update', function(data, cb){
  //     cb(null, data);
  //   });

  //   var myTable = bindTable('myTable');
  //   myTable.add({name: 'Bob'})
  //     .then(function(record){
  //       return myTable.add({name: 'james'});
  //     })
  //     .then(function(record){
  //       record.name = 'James Moore';
  //       return myTable.update(record);
  //     })
  //     .then(function(updatedRecord){
  //       expect(myTable.rows[0].name).toEqual('Bob');
  //       done();
  //     });
  // });

  // it('should delete a record', function(done){
  //   var idCounter = 0;
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = ++idCounter;
  //     cb(null, data);
  //   });
  //   mockSocket.on('myTable:delete', function(data, cb){
  //     cb(null, data);
  //   });
  //   var myTable = bindTable('myTable');
  //   myTable.add({name: 'James'})
  //     .then(function (record) {
  //       return myTable.add({name: 'Bob'})
  //     })
  //     .then(function(record){
  //       return myTable.delete(record)
  //     })
  //     .then(function(result){
  //       expect(myTable.rows.length).toEqual(1);
  //       done();
  //     });
  // });

  // it('should update array automatically on outside update', function(done){
  //   mockSocket.on('myTable:add', function(data, cb){
  //     data.id = 100;
  //     cb(null, data);
  //   });

  //   var myTable = bindTable('myTable');
  //   myTable.bind({}, 10, 0);
  //   myTable.add({name: 'James'})
  //     .then(function(record){
  //       var changes = {
  //         new_val: {
  //           id: 100,
  //           name: 'James Moore'
  //         },
  //         old_val: {
  //           id: 100,
  //           name: 'James'
  //         }
  //       };
  //       mockSocket.emit('myTable:changes', changes, function(err, response){
  //         expect(myTable.rows[0].name).toEqual('James Moore');
  //         done();
  //       })
  //     });
  // });
});
