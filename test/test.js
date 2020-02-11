const mongo = require('../index.js');
const assert = require('assert');

describe('use mongodb 3 driver in a 2.x style', function() {
  let db;
  let trees;

  after(function(done) {
    if (trees) {
      trees.remove({}, function(err) {
        assert.ifError(err);
        db.close(function(err) {
          assert.ifError(err);
          done();
        });
      });
    }
  });

  it('connects', function(done) {
    return mongo.MongoClient.connect('mongodb://localhost:27017/testdb', function (err, _db) {
      assert.ifError(err);
      assert(_db.__emulated);
      assert(_db);
      assert(_db.collection);
      db = _db;
      done();
    });
  });
  it('gets collection', function(done) {
    return db.collection('trees', function(err, collection) {
      assert.ifError(err);
      assert(collection);
      assert(collection.__emulated);
      trees = collection;
      done();
    });
  });
  it('inserts', function(done) {
    return trees.insert([
      {
        kind: 'spruce',
        leaves: 5
      },
      {
        kind: 'pine',
        leaves: 10
      }
    ], function(err) {
      assert.ifError(err);
      done();
    });
  });
  it('finds without projection', function(done) {
    const cursor = trees.find({});
    assert(cursor.__emulated);
    cursor.sort({ leaves: 1 }).toArray(function(err, result) {
      assert.ifError(err);
      assert(result);
      assert(result[0]);
      assert(result[1]);
      assert.equal(result[0].kind, 'spruce');
      assert.equal(result[0].leaves, 5);
      assert.equal(result[1].kind, 'pine');
      assert.equal(result[1].leaves, 10);
      done();
    });
  });
  it('finds with projection', function(done) {
    return trees.find({}, { kind: 1 }).sort({ leaves: 1 }).toArray(function(err, result) {
      assert.ifError(err);
      assert(result);
      assert(result[0]);
      assert.equal(result[0].kind, 'spruce');
      assert(!result[0].leaves);
      done();
    });
  });
  it('findOne', function(done) {
    return trees.findOne({ leaves: 5 }, function(err, result) {
      assert.ifError(err);
      assert(result);
      assert.equal(result.kind, 'spruce');
      done();
    });
  });
  it('findOne with projection', function(done) {
    return trees.findOne({ leaves: 5 }, { kind: 1 }, function(err, result) {
      assert.ifError(err);
      assert(result);
      assert(result.kind);
      assert(!result.leaves);
      assert.equal(result.kind, 'spruce');
      done();
    });
  });
  it('find with nextObject', function(done) {
    const cursor = trees.find({}).sort({ leaves: 1 });
    cursor.nextObject(function(err, result) {
      assert.ifError(err);
      assert(result);
      assert(result.leaves === 5);
      cursor.nextObject(function(err, result) {
        assert.ifError(err);
        assert(result);
        assert(result.leaves === 10);
        done();
      });
    });
  });
  it('updates one with an atomic operator', function(done) {
    return trees.update({ kind: 'spruce' }, { $set: { kind: 'puce' } }, function(err, status) {
      assert(!err);
      assert(status.result.nModified === 1);
      return trees.findOne({ kind: 'puce' }, function(err, obj) {
        assert(!err);
        assert(obj);
        done();
      });
    });
  });
  it('updates one without an atomic operator', function(done) {
    return trees.update({ kind: 'puce' }, { kind: 'truce', leaves: 70 }, function(err, status) {
      assert(!err);
      assert(status.result.nModified === 1);
      return trees.findOne({ kind: 'truce' }, function(err, obj) {
        assert(!err);
        assert(obj);
        done();
      });
    });
  });
  it('updates many with an atomic operator', function(done) {
    return trees.update({ leaves: { $gte: 1 } }, { $set: { age: 50 } }, { multi: true }, function(err, status) {
      assert(!err);
      assert(status.result.nModified === 2);
      return trees.find({}).toArray(function(err, trees) {
        assert(!err);
        assert(trees.length > 1);
        assert(!trees.find(tree => (tree.leaves > 0) && (tree.age !== 50)));
        done();
      });
    });
  });
  it('updates many without an atomic operator', function(done) {
    return trees.update({ leaves: { $gte: 1 } }, { leaves: 1, kind: 'boring' }, { multi: true }, function(err, status) {
      assert(!err);
      assert(status.result.nModified === 2);
      return trees.find({}).toArray(function(err, trees) {
        assert(!err);
        assert(trees.length > 1);
        assert(!trees.find(tree => (tree.leaves !== 1) || (tree.kind !== 'boring') || tree.age));
        done();
      });
    });
  });
  it('updates many without an atomic operator, using promises', function() {
    return trees.update({ leaves: { $gte: 1 } }, { ohmy: true }, { multi: true }).then(function(status) {
      return trees.find({}).toArray();
    }).then(function(trees) {
      assert(trees.length > 1);
      assert(!trees.find(tree => (tree.ohmy !== true) || tree.leaves));
    });
  });
});
