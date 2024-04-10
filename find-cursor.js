const { toEmulate } = require('./utils.js');

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

      // TODO: implement collection
      const collection = {
        countDocuments: () => {}
      };
      return collection.countDocuments(
        this[super.kFilter],
        {
          ...this[super.kBuiltOptions],
          ...this.cursorOptions,
          ...(options || {})
        },
        callback
      );
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
