const { toEmulate } = require('./utils.js');

module.exports = function (baseClass) {
  class EmulateMongoClient extends baseClass {
    constructor(connectionString, options) {
      const {
        useUnifiedTopology,
        useNewUrlParser,
        ...v6Options
      } = options || {};

      super(connectionString, v6Options);
    }

    db(dbName, options) {
      return super.db(dbName, options)[toEmulate]();
    }
  }

  return EmulateMongoClient;
};
