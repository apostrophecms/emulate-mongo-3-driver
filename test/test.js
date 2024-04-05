const assert = require('assert/strict');
const mongo = require('../index.js');

describe('use mongodb 6.x driver in a 3.x style', function() {
  let client;
  let db;

  afterEach(async function() {
    const collections = await db.collections();
    await Promise.all(collections.map(collection => db.dropCollection(collection.collectionName)));
    await client.close();
  });

  beforeEach(async function() {
    client = new mongo.MongoClient('mongodb://localhost:27017/testdb', {});
    await client.connect();
    db = client.db();
  });

  describe('collection', function() {
    // [ ] bulkWrite
    // [x] ensureIndex
    // [x] insert
    //   [x] insertMany
    //   [x] insertOne
    // [x] remove
    //   [x] deleteMany
    //   [x] deleteOne
    //   [x] removeMany
    //   [x] removeOne
    // [x] rename
    // [x] replaceOne
    // [x] update
    //   [x] updateMany
    //   [x] updateOne

    it('collection.ensureIndex (callback)', function(done) {
      const trees = db.collection('trees');

      trees.ensureIndex(
        {
          location: '2dsphere'
        },
        {},
        (err, index) => {
          assert.ifError(err);
          const actual = index;
          const expected = 'location_2dsphere';

          assert.equal(actual, expected);
          done();
        }
      );
    });
    it('collection.ensureIndex (promise)', async function() {
      const trees = db.collection('trees');

      const actual = await trees.ensureIndex({
        location: '2dsphere'
      });
      const expected = 'location_2dsphere';

      assert.equal(actual, expected);
    });

    it('collection.insert array (callback)', function(done) {
      const trees = db.collection('trees');

      trees.insert(
        [
          {
            title: 'birch'
          },
          {
            title: 'oak'
          }
        ],
        {},
        (err, result) => {
          try {
            assert.ifError(err);
            const actual = result;
            const expected = {
              acknowledged: true,
              insertedCount: 2,
              insertedIds: actual.insertedIds,
              result: {
                getInsertedIds: actual.insertedIds,
                getUpsertedIds: undefined,
                nInserted: 2,
                nMatched: undefined,
                nModified: undefined,
                nRemoved: undefined,
                nUpserted: undefined
              }
            };

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('collection.insert array (promise)', async function() {
      const trees = db.collection('trees');

      const actual = await trees.insert(
        [
          {
            title: 'birch'
          },
          {
            title: 'oak'
          }
        ]
      );
      const expected = {
        acknowledged: true,
        insertedCount: 2,
        insertedIds: actual.insertedIds,
        result: {
          getInsertedIds: actual.insertedIds,
          getUpsertedIds: undefined,
          nInserted: 2,
          nMatched: undefined,
          nModified: undefined,
          nRemoved: undefined,
          nUpserted: undefined
        }
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.insert (callback)', function(done) {
      const trees = db.collection('trees');

      trees.insert(
        {
          title: 'birch'
        },
        {},
        (err, result) => {
          try {
            assert.ifError(err);
            const actual = result;
            const expected = {
              acknowledged: true,
              insertedId: actual.insertedId,
              result: {
                getInsertedIds: undefined,
                getUpsertedIds: undefined,
                nInserted: undefined,
                nMatched: undefined,
                nModified: undefined,
                nRemoved: undefined,
                nUpserted: undefined
              }
            };

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('collection.insert (promise)', async function() {
      const trees = db.collection('trees');

      const actual = await trees.insert({
        title: 'birch'
      });
      const expected = {
        acknowledged: true,
        insertedId: actual.insertedId,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: undefined,
          nModified: undefined,
          nRemoved: undefined,
          nUpserted: undefined
        }
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.remove (callback)', function(done) {
      const trees = db.collection('trees');
      Promise.all([
        trees.insert({ title: 'birch' }),
        trees.insert({ title: 'oak' })
      ])
        .then(() => {
          trees.remove(
            {
              title: {
                $in: [ 'birch', 'oak' ]
              }
            },
            {},
            (err, result) => {
              try {
                assert.ifError(err);
                const actual = result;
                const expected = {
                  acknowledged: true,
                  deletedCount: 2,
                  result: {
                    getInsertedIds: undefined,
                    getUpsertedIds: undefined,
                    nInserted: undefined,
                    nMatched: undefined,
                    nModified: undefined,
                    nRemoved: 2,
                    nUpserted: undefined
                  }
                };

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.remove (promise)', async function() {
      const trees = db.collection('trees');
      await trees.insert({ title: 'birch' });
      await trees.insert({ title: 'oak' });

      const actual = await trees.remove({
        title: {
          $in: [ 'birch', 'oak' ]
        }
      });
      const expected = {
        acknowledged: true,
        deletedCount: 2,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: undefined,
          nModified: undefined,
          nRemoved: 2,
          nUpserted: undefined
        }
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.remove single (callback)', function(done) {
      const trees = db.collection('trees');
      Promise.all([
        trees.insert({ title: 'birch' }),
        trees.insert({ title: 'oak' })
      ])
        .then(() => {
          trees.remove(
            {
              title: {
                $in: [ 'birch', 'oak' ]
              }
            },
            {
              single: true
            },
            (err, result) => {
              try {
                assert.ifError(err);
                const actual = result;
                const expected = {
                  acknowledged: true,
                  deletedCount: 1,
                  result: {
                    getInsertedIds: undefined,
                    getUpsertedIds: undefined,
                    nInserted: undefined,
                    nMatched: undefined,
                    nModified: undefined,
                    nRemoved: 1,
                    nUpserted: undefined
                  }
                };

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.remove single (promise)', async function() {
      const trees = db.collection('trees');
      await trees.insert({ title: 'birch' });
      await trees.insert({ title: 'oak' });

      const actual = await trees.remove(
        {
          title: {
            $in: [ 'birch', 'oak' ]
          }
        },
        {
          single: true
        }
      );
      const expected = {
        acknowledged: true,
        deletedCount: 1,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: undefined,
          nModified: undefined,
          nRemoved: 1,
          nUpserted: undefined
        }
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.rename (callback)', function(done) {
      db.createCollection('leaves')
        .then((leaves) => {
          leaves.rename(
            'branches',
            {},
            function(err, collection) {
              try {
                assert.ifError(err);
                const actual = collection.constructor;
                const expected = mongo.Collection;

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.rename (promise)', async function() {
      const leaves = await db.createCollection('leaves');

      const collection = await leaves.rename('branches', {});

      const actual = collection.constructor;
      const expected = mongo.Collection;

      assert.deepEqual(actual, expected);
    });

    it('collection.replaceOne (callback)', function(done) {
      const trees = db.collection('trees');
      trees.insert({ title: 'birch' })
        .then(() => {
          trees.replaceOne(
            {
              title: 'birch'
            },
            {},
            (err, result) => {
              try {
                assert.ifError(err);
                const actual = result;
                const expected = {
                  acknowledged: true,
                  matchedCount: 1,
                  modifiedCount: 1,
                  result: {
                    getInsertedIds: undefined,
                    getUpsertedIds: undefined,
                    nInserted: undefined,
                    nMatched: 1,
                    nModified: 1,
                    nRemoved: undefined,
                    nUpserted: 0
                  },
                  upsertedCount: 0,
                  upsertedId: null
                };

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.replaceOne (promise)', async function() {
      const trees = db.collection('trees');
      await trees.insert({ title: 'birch' });

      const actual = await trees.replaceOne(
        {
          title: 'birch'
        },
        {
          title: 'oak',
          age: 37
        },
        {}
      );
      const expected = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: 1,
          nModified: 1,
          nRemoved: undefined,
          nUpserted: 0
        },
        upsertedCount: 0,
        upsertedId: null
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.update multi (callback)', function(done) {
      const trees = db.collection('trees');
      Promise.all([
        trees.insert({ title: 'birch' }),
        trees.insert({ title: 'oak' })
      ])
        .then(() => {
          trees.update(
            {
              title: {
                $in: [ 'birch', 'oak' ]
              }
            },
            {
              $set: {
                age: 37
              }
            },
            {
              multi: true
            },
            (err, result) => {
              try {
                assert.ifError(err);
                const actual = result;
                const expected = {
                  acknowledged: true,
                  matchedCount: 2,
                  modifiedCount: 2,
                  result: {
                    getInsertedIds: undefined,
                    getUpsertedIds: undefined,
                    nInserted: undefined,
                    nMatched: 2,
                    nModified: 2,
                    nRemoved: undefined,
                    nUpserted: 0
                  },
                  upsertedCount: 0,
                  upsertedId: null
                };

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.update multi (promise)', async function() {
      const trees = db.collection('trees');
      await trees.insert({ title: 'birch' });
      await trees.insert({ title: 'oak' });

      const actual = await trees.update(
        {
          title: {
            $in: [ 'birch', 'oak' ]
          }
        },
        {
          $set: {
            age: 37
          }
        },
        {
          multi: true
        }
      );
      const expected = {
        acknowledged: true,
        matchedCount: 2,
        modifiedCount: 2,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: 2,
          nModified: 2,
          nRemoved: undefined,
          nUpserted: 0
        },
        upsertedCount: 0,
        upsertedId: null
      };

      assert.deepEqual(actual, expected);
    });

    it('collection.update (callback)', function(done) {
      const trees = db.collection('trees');
      Promise.all([
        trees.insert({ title: 'birch' }),
        trees.insert({ title: 'oak' })
      ])
        .then(() => {
          trees.update(
            {
              title: {
                $in: [ 'birch', 'oak' ]
              }
            },
            {
              $set: {
                age: 37
              }
            },
            {},
            (err, result) => {
              try {
                assert.ifError(err);
                const actual = result;
                const expected = {
                  acknowledged: true,
                  matchedCount: 1,
                  modifiedCount: 1,
                  result: {
                    getInsertedIds: undefined,
                    getUpsertedIds: undefined,
                    nInserted: undefined,
                    nMatched: 1,
                    nModified: 1,
                    nRemoved: undefined,
                    nUpserted: 0
                  },
                  upsertedCount: 0,
                  upsertedId: null
                };

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('collection.update (promise)', async function() {
      const trees = db.collection('trees');
      await trees.insert({ title: 'birch' });
      await trees.insert({ title: 'oak' });

      const actual = await trees.update(
        {
          title: {
            $in: [ 'birch', 'oak' ]
          }
        },
        {
          $set: {
            age: 37
          }
        },
        {}
      );
      const expected = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        result: {
          getInsertedIds: undefined,
          getUpsertedIds: undefined,
          nInserted: undefined,
          nMatched: 1,
          nModified: 1,
          nRemoved: undefined,
          nUpserted: 0
        },
        upsertedCount: 0,
        upsertedId: null
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('db', function() {
    it('db.collections (callback)', function(done) {
      db.collections(
        {},
        function(err, collections) {
          try {
            assert.ifError(err);
            const actual = collections.map(collection => collection.constructor);
            const expected = Array(collections.length).fill(mongo.Collection);

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('db.collections (promise)', async function() {
      const collections = await db.collections();

      const actual = collections.map(collection => collection.constructor);
      const expected = Array(collections.length).fill(mongo.Collection);

      assert.deepEqual(actual, expected);
    });

    it('db.collection (callback)', function(done) {
      db.collection(
        'trees',
        {},
        function(err, collection) {
          try {
            assert.ifError(err);
            const actual = collection.constructor;
            const expected = mongo.Collection;

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('db.collection (promise)', async function() {
      const collection = await db.collection('trees', {});

      const actual = collection.constructor;
      const expected = mongo.Collection;

      assert.deepEqual(actual, expected);
    });

    it('db.createCollection (callback)', function(done) {
      db.createCollection(
        'leaves',
        {},
        function(err, collection) {
          try {
            assert.ifError(err);
            const actual = collection.constructor;
            const expected = mongo.Collection;

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('db.createCollection (promise)', async function() {
      const collection = await db.createCollection('leaves', {});

      const actual = collection.constructor;
      const expected = mongo.Collection;

      assert.deepEqual(actual, expected);
    });

    it('db.ensureIndex (callback)', function(done) {
      db.ensureIndex(
        'location_2dsphere',
        {
          location: '2dsphere'
        },
        {},
        (err, index) => {
          try {
            assert.ifError(err);
            const actual = index;
            const expected = 'location_2dsphere';

            assert.equal(actual, expected);
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('db.ensureIndex (promise)', async function() {
      const actual = await db.ensureIndex(
        'location_2dsphere',
        {
          location: '2dsphere'
        }
      );
      const expected = 'location_2dsphere';

      assert.equal(actual, expected);
    });

    it('db.renameCollection (callback)', function(done) {
      db.createCollection('leaves')
        .then(() => {
          db.renameCollection(
            'leaves',
            'branches',
            {},
            function(err, collection) {
              try {
                assert.ifError(err);
                const actual = collection.constructor;
                const expected = mongo.Collection;

                assert.deepEqual(actual, expected);
                done();
              } catch (error) {
                done(error);
              }
            }
          );
        });
    });
    it('db.renameCollection (promise)', async function() {
      await db.createCollection('leaves');

      const collection = await db.renameCollection('leaves', 'branches', {});

      const actual = collection.constructor;
      const expected = mongo.Collection;

      assert.deepEqual(actual, expected);
    });
  });

  describe('logger', function() {
    it('logger.setLevel', function() {
      assert.doesNotThrow(
        () => {
          mongo.Logger.setLevel('info');
        }
      );
    });
  });

  describe('mongo-client', function() {
    it('mongoClient.constructor removes warnings', function() {
      const warningListener = warning => {
        if (warning.includes('[MONGODB DRIVER] Warning:')) {
          assert.fail('should not throws warning for deprecated options');
        }
      };
      process.on('warning', warningListener);

      try {
        const options = {
          useUnifiedTopology: true,
          useNewUrlParser: true
        };
        const currentClient = new mongo.MongoClient('mongodb://localhost:27017/testdb', options);
        currentClient.close();
      } finally {
        process.removeListener('warning', warningListener);
      }
    });

    it('mongoClient.connect static (callback)', function(done) {
      mongo.MongoClient.connect(
        'mongodb://localhost:27017/testdb',
        {},
        (err, currentClient) => {
          try {
            assert.ifError(err);
            const actual = currentClient.constructor;
            const expected = mongo.MongoClient;

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          } finally {
            currentClient.close();
          }
        }
      );
    });
    it('mongoClient.connect static (promise)', async function() {
      const currentClient = await mongo.MongoClient.connect('mongodb://localhost:27017/testdb', {});

      try {
        const actual = currentClient.constructor;
        const expected = mongo.MongoClient;

        assert.deepEqual(actual, expected);
      } finally {
        currentClient.close();
      }
    });

    it('mongoClient.connect (callback)', function(done) {
      const newClient = new mongo.MongoClient('mongodb://localhost:27017/testdb', {});
      newClient.connect(
        (err, currentClient) => {
          try {
            assert.ifError(err);
            const actual = currentClient.constructor;
            const expected = mongo.MongoClient;

            assert.deepEqual(actual, expected);
            done();
          } catch (error) {
            done(error);
          } finally {
            currentClient.close();
          }
        }
      );
    });
    it('mongoClient.connect (promise)', async function() {
      const newClient = new mongo.MongoClient('mongodb://localhost:27017/testdb', {});
      const currentClient = await newClient.connect();

      try {
        const actual = currentClient.constructor;
        const expected = mongo.MongoClient;

        assert.deepEqual(actual, expected);
      } finally {
        currentClient.close();
      }
    });

    it('mongoClient.db', function() {
      const currentDb = client.db('testdb', {});

      const actual = currentDb.constructor;
      const expected = mongo.Db;

      assert.deepEqual(actual, expected);
    });
  });
});
