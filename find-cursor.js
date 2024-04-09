const { toEmulate, wrapMaybeCallback } = require('./utils.js');

module.exports = function (baseClass) {
  class EmulateFindCursor extends baseClass {
    count(options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
          ? options
          : undefined;
      options = typeof options !== 'function' ? options : undefined;

      console.log({ self: this, client: super.client });
      // console.log(this.namespace.db);
      const collection = {
        countDocuments: () => {}
      }
      // console.log(this.namespace.collection);
      return collection.countDocuments(
        this[super.kFilter],
        {
          ...this[super.kBuiltOptions],
          ...this.cursorOptions,
          ...(options || {})
        },
        callback
      )
    }
  }

  Object.defineProperty(
    baseClass.prototype,
    toEmulate,
    {
      enumerable: false,
      value: function () {
        Object.setPrototypeOf(this, EmulateFindCursor.prototype);
        return this;
      }
    }
  );

  return EmulateFindCursor;
};
