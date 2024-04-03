const { toLegacy } = require('mongodb-legacy/src/utils');

module.exports = function (baseClass) {
  // - `BulkWriteResult.nInserted` -> `BulkWriteResult.insertedCount`
  // - `BulkWriteResult.nUpserted` -> `BulkWriteResult.upsertedCount`
  // - `BulkWriteResult.nMatched` -> `BulkWriteResult.matchedCount`
  // - `BulkWriteResult.nModified` -> `BulkWriteResult.modifiedCount`
  // - `BulkWriteResult.nRemoved` -> `BulkWriteResult.deletedCount`
  // - `BulkWriteResult.getUpsertedIds` -> `BulkWriteResult.upsertedIds` / `BulkWriteResult.getUpsertedIdAt(index: number)`
  // - `BulkWriteResult.getInsertedIds` -> `BulkWriteResult.insertedIds`
  const enrichResult = result => {
    result.nInserted = result.insertedCount;
    result.nUpserted = result.upsertedCount;
    result.nMatched = result.matchedCount;
    result.nModified = result.modifiedCount;
    result.nRemoved = result.deletedCount;
    result.getUpsertedIds = result.upsertedIds;
    result.getInsertedIds = result.insertedIds;
  };

  class EmulateCollection extends baseClass {
    bulkWrite(operations, options, ...args) {
      const result = super.bulkWrite(operations, options, ...args);

      return enrichResult(result);
    }

    insertOne(doc, options, ...args) {
      const result = super.insertOne(doc, options, ...args);

      return enrichResult(result);
    }

    insertMany(docs, options, ...args) {
      const result = super.insertMany(docs, options, options, ...args);

      return enrichResult(result);
    }

    deleteOne(filter, options, ...args) {
      const result = super.deleteOne(filter, options, ...args);

      return enrichResult(result);
    }

    deleteMany(filter, options, ...args) {
      const result = super.deleteMany(filter, options, ...args);

      return enrichResult(result);
    }

    replaceOne(filter, replacement, options, ...args) {
      const result = super.replaceOne(filter, replacement, options, ...args);

      return enrichResult(result);
    }

    updateOne(filter, update, options, ...args) {
      const result = super.updateOne(filter, update, options, ...args);
      console.log('!!!!', result);

      return enrichResult(result);
    }

    updateMany(filter, update, options, ...args) {
      const result = super.updateMany(filter, update, options, ...args);

      return enrichResult(result);
    }
  }

  Object.defineProperty(baseClass.prototype, toLegacy, {
    enumerable: false,
    value: function () {
      return Object.setPrototypeOf(this, EmulateCollection.prototype);
    }
  });

  return EmulateCollection;
}
