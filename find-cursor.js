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

      const collection = this.client.db(this.namespace.db).collection(this.namespace.collection);
      const symbols = Object.getOwnPropertySymbols(this);
      const [ filter ] = symbols.filter(symbol => symbol.description === 'filter');
      const [ builtOptions ] = symbols.filter(symbol => symbol.description === 'builtOptions');

      return collection.countDocuments(
        this[filter],
        {
          ...this[builtOptions],
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
