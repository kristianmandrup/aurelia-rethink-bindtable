import EntityListener from './entity-listener'; 

export class EntityBinders {
  constructor(options, ...tableNames) {
    this.tableBinders = tableNames.reduce((obj, tableName) => {
      obj[tableName] = new EntityListener(tableName, options)
      return obj;
    }, {});
  }

  named(name) {
    return this.tableBinders[name];
  }
}

export default function connect(options) {
  return {
    forTables: function(...tableNames) {
      return new EntityBinders(options, ...tables).listen();
    }
  };
}