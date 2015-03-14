jasmine.DEFAULT_TIMEOUT_INTERVAL = 1500;

import BindTable from '../src/bindtable';
import io from '../mock/socket-io';

describe('BindTable', () => {
  var mockSocket;
  var bindTable;

  beforeEach(() => {
    mockSocket = io.connect();
    bindTable = BindTable.create({socket: mockSocket});
  });

  afterEach(() => {
    mockSocket = null;
    bindTable = null;
  });

  it('should add a record that is returned in promise', done => {
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 123;
      cb(null, data);
    });

    let assert = record => {
      expect(record.id).toEqual(123);
      done();
    };

    bindTable.table('myTable')
             .add({name: 'james'})
             .then(assert);
  });

  it('should add a record that is returned in promise', (done) => {
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 123;
      cb(null, data);
    });

    let assert = record => {
      expect(record.id).toEqual(123);
      done();
    };

    bindTable.table('myTable')
             .add({name: 'james'})
             .then(assert);
  });

  it('should add a record that is in rows array', (done) => {
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 123;
      cb(null, data);
    });

    let assert = record => {
      expect(myTable.rows.length).toEqual(1);
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
           .then(assert);
  });

  it('should update an existing record', (done) => {
    mockSocket.on('myTable:update', (data, cb) => cb(null, data));
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 123;
      cb(null, data);
    });

    let update = record => {
      record.name = 'James Moore';
      return myTable.update(record);
    };

    let assert = updatedRecord => {
      expect(updatedRecord.name).toEqual('James Moore');
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
           .then(update)
           .then(assert);
  });

  it('should update an existing record in the rows array', (done) => {
    mockSocket.on('myTable:update', (data, cb) => cb(null, data));
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 123;
      cb(null, data);
    });

    let update = record => {
      record.name = 'James Moore';
      return myTable.update(record);
    };

    let assert = updatedRecord => {
      expect(myTable.rows[0].name).toEqual('James Moore');
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.add({name: 'james'})
           .then(update)
           .then(assert);
  });

  it('should not update other records in rows array', (done) => {
    var idCounter = 0;
    mockSocket.on('myTable:update', (data, cb) => cb(null, data));
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = ++idCounter;
      cb(null, data);
    });

    let addAnother = record => myTable.add({name: 'james'});

    let update = record => {
      record.name = 'James Moore';
      return myTable.update(record);
    };

    let assert = updatedRecord => {
      expect(myTable.rows[0].name).toEqual('Bob');
      expect(myTable.rows[1].name).toEqual('James Moore')
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.add({name: 'Bob'})
           .then(addAnother)
           .then(update)
           .then(assert);
  });

  it('should delete a record', (done) => {
    var idCounter = 0;
    mockSocket.on('myTable:delete', (data, cb) => cb(null, data));
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = ++idCounter;
      cb(null, data);
    });

    let addAnother = record => myTable.add({name: 'Bob'});

    let deleteRecord = record => myTable.delete(record);

    let assert = result => {
      expect(myTable.rows.length).toEqual(1);
      expect(myTable.rows[0].name).toEqual('James');
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.add({name: 'James'})
           .then(addAnother)
           .then(deleteRecord)
           .then(assert);
  });

  it('should update array automatically on outside update', (done) => {
    var changes = {
      new_val: { id: 100, name: 'James Moore' },
      old_val: { id: 100, name: 'James'}
    };
    mockSocket.on('myTable:add', (data, cb) => {
      data.id = 100;
      cb(null, data);
    });

    let updateAndAssert = record => mockSocket.emit('myTable:changes', changes, assert);

    let assert = (err, response) => {
      expect(myTable.rows[0].name).toEqual('James Moore');
      done();
    };

    var myTable = bindTable.table('myTable');
    myTable.bind({}, 10, 0);
    myTable.add({name: 'James'})
           .then(updateAndAssert);
  });
});
