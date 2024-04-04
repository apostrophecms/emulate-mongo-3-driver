const { toEmulate, wrapMaybeCallback } = require('./utils.js');

module.exports = function (baseClass) {
  // - `BulkWriteResult.nInserted` -> `BulkWriteResult.insertedCount`
  // - `BulkWriteResult.nUpserted` -> `BulkWriteResult.upsertedCount`
  // - `BulkWriteResult.nMatched` -> `BulkWriteResult.matchedCount`
  // - `BulkWriteResult.nModified` -> `BulkWriteResult.modifiedCount`
  // - `BulkWriteResult.nRemoved` -> `BulkWriteResult.deletedCount`
  // - `BulkWriteResult.getUpsertedIds` -> `BulkWriteResult.upsertedIds`
  //     `BulkWriteResult.getUpsertedIdAt(index: number)`
  // - `BulkWriteResult.getInsertedIds` -> `BulkWriteResult.insertedIds`
  const enrichWithResult = function (response) {
    const result = {
      nInserted: response.insertedCount,
      nUpserted: response.upsertedCount,
      nMatched: response.matchedCount,
      nModified: response.modifiedCount,
      nRemoved: response.deletedCount,
      getUpsertedIds: response.upsertedIds,
      getInsertedIds: response.insertedIds
    };

    return {
      result,
      ...response
    };
  };

  class EmulateCollection extends baseClass {
    bulkWrite(operations, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.bulkWrite(operations, options),
        callback,
        enrichWithResult
      );
    }

    ensureIndex(indexSpec, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.createIndex(indexSpec, options),
        callback
      );
    }

    insert(docs, options, callback) {
      if (Array.isArray(docs)) {
        return this.insertMany(docs, options, callback);
      }

      return this.insertOne(docs, options, callback);
    }

    insertMany(docs, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.insertMany(docs, options),
        callback,
        enrichWithResult
      );
    }

    insertOne(doc, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.insertOne(doc, options),
        callback,
        enrichWithResult
      );
    }

    deleteMany(filter, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : typeof filter === 'function'
              ? filter
              : undefined;
      options = typeof options !== 'function' ? options : undefined;
      filter = typeof filter !== 'function' ? filter : undefined;

      return wrapMaybeCallback(
        super.deleteMany(filter, options),
        callback,
        enrichWithResult
      );
    }

    deleteOne(filter, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : typeof filter === 'function'
              ? filter
              : undefined;
      options = typeof options !== 'function' ? options : undefined;
      filter = typeof filter !== 'function' ? filter : undefined;

      return wrapMaybeCallback(
        super.deleteOne(filter, options),
        callback,
        enrichWithResult
      );
    }

    remove(filter, options, callback) {
      if (options?.single) {
        const { single, ...newOptions } = options;

        return this.deleteOne(filter, newOptions, callback);
      }

      return this.deleteMany(filter, options, callback);
    }

    removeMany(filter, options, callback) {
      return this.deleteMany(filter, options, callback);
    }

    rename(newName, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.rename(newName, options).then(collection => collection[toEmulate]()),
        callback
      );
    }

    replaceOne(filter, replacement, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.replaceOne(filter, replacement, options),
        callback,
        enrichWithResult
      );
    }

    update(filter, update, options, callback) {
      if (options?.multi) {
        const { multi, ...newOptions } = options;

        return this.updateMany(filter, update, newOptions, callback);
      }

      return this.updateOne(filter, update, options, callback);
    }

    updateMany(filter, update, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.updateMany(filter, update, options),
        callback,
        enrichWithResult
      );
    }

    updateOne(filter, update, options, callback) {
      callback =
        typeof callback === 'function'
          ? callback
          : typeof options === 'function'
            ? options
            : undefined;
      options = typeof options !== 'function' ? options : undefined;

      return wrapMaybeCallback(
        super.updateOne(filter, update, options),
        callback,
        enrichWithResult
      );
    }
  }

  Object.defineProperty(
    baseClass.prototype,
    toEmulate,
    {
      enumerable: false,
      value: function () {
        return Object.setPrototypeOf(this, EmulateCollection.prototype);
      }
    }
  );

  return EmulateCollection;
};
