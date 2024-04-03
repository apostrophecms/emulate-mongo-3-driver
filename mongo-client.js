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
  }

  return EmulateMongoClient;
}
