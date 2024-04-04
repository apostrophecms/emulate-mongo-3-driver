const { toEmulate } = require('./utils.js');

module.exports = function (baseClass) {
  class EmulateDb extends baseClass {
    collection(name, options) {
      return super.collection(name, options)[toEmulate]();
    }
  }

  Object.defineProperty(
    baseClass.prototype,
    toEmulate,
    {
      enumerable: false,
      value: function () {
        return Object.setPrototypeOf(this, EmulateDb.prototype);
      }
    }
  );

  return EmulateDb;
}
