const mongodb = require('mongodb');

function decorate(obj) {
  const tinsel = {
    __emulated: true
  };

  const neverDecorate = [
    'apply', 'call', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'arguments', 'caller', 'callee', 'super_', 'constructor', 'bind'
  ];

  // Other possible bad things to decorate, but I think I
  // got all the functions:
  //
  // 'length',               'name',
  // 'prototype',            'super_',
  // 'connect',              'arguments',
  // 'caller',               'constructor',
  // 'apply',                'bind',
  // 'call',                 'toString',
  // '__defineGetter__',     '__defineSetter__',
  // 'hasOwnProperty',       '__lookupGetter__',
  // '__lookupSetter__',     'isPrototypeOf',
  // 'propertyIsEnumerable', 'valueOf',
  // '__proto__',            'toLocaleString'

  const allProperties = getAllProperties(obj);

  for (const p of allProperties) {
    if (neverDecorate.indexOf(p) !== -1) {
      continue;
    }
    if ((typeof obj[p]) === 'function') {
      tinsel[p] = function() {
        const result = obj[p].apply(obj, arguments); 
        if (result === obj) {
          // So that chained methods chain on the
          // decorated object, not the original
          return tinsel;
        } else {
          return result;
        }
      };
    }
  }
  return tinsel;

  // https://stackoverflow.com/questions/8024149/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object
  function getAllProperties(obj) {
    const allProps = [];
    let curr = obj;
    do {
      const props = Object.getOwnPropertyNames(curr)
      props.forEach(function(prop){
        if (allProps.indexOf(prop) === -1) {
          allProps.push(prop)
        }
      });
    } while (curr = Object.getPrototypeOf(curr));
    return allProps;
  }
}

module.exports = mongodb;

const OriginalClient = module.exports.MongoClient;
const MongoClient = decorate(OriginalClient);

// Convert (err, client) back to (err, db) in both callback driven
// and promisified flavors

const superConnect = OriginalClient.connect;
MongoClient.connect = function(uri, options, callback) {
  if ((!callback) && ((typeof options) === 'function')) {
    callback = options;
    options = {};
  }
  if ((typeof callback) === 'function') {
    return superConnect.call(OriginalClient, uri, options, function(err, client) {
      if (err) {
        return callback(err);
      }
      const parsed = new URL(uri);
      try {
        return callback(null, decorateDb(client.db(parsed.pathname.substr(1)), client));
      } catch (e) {
        return callback(e);
      }
    });
  }
  if (!options) {
    options = {};
  }
  return superConnect.call(OriginalClient, uri, options).then(function(client) {
    const parsed = new URL(uri);
    return decorateDb(client.db(parsed.pathname.substr(1)), client);
  });
};

// TODO: also wrap legacy db.open? We never used it. See:
// See https://github.com/mongodb/node-mongodb-native/blob/3.0/CHANGES_3.0.0.md

module.exports.MongoClient = MongoClient;

function decorateDb(db, client) {
  const newDb = decorate(db);
  // Custom-wrap the "collection" method of db objects
  const superCollection = db.collection;
  newDb.collection = function(name, options, callback) {
    if (arguments.length === 1) {
      return decorateCollection(superCollection.call(db, name));
    }
    if (arguments.length === 2) {
      if ((typeof options) !== 'function') {
        return decorateCollection(superCollection.call(db, name, options));
      } else {
        callback = options;
        return superCollection.call(db, name, function(err, collection) {
          if (err) {
            return callback(err);
          }
          const decorated = decorateCollection(collection);
          return callback(null, decorated);
        });
      }
    }
    return superCollection.call(db, name, options, function(err, collection) {
      if (err) {
        return callback(err);
      }
      return callback(null, decorateCollection(collection));
    });
  };
  // Reintroduce the "db" method of db objects, for talking to a second
  // database via the same connection
  newDb.db = function(name) { 
    return decorateDb(client.db(name));
  };
  // Reintroduce the "close" method of db objects, yes it closes
  // the entire client, did that before too
  newDb.close = function() { 
    return client.close.apply(client, arguments);
  };
  return newDb;
}

function decorateCollection(collection) {
  const newCollection = decorate(collection);
  const superFind = collection.find;
  newCollection.find = function(criteria, projection) {
    const originalCursor = superFind.call(collection, criteria);
    const cursor = decorateCursor(originalCursor);
    if (projection) {
      return cursor.project(projection);
    } else {
      return cursor;
    }
  };
  // Before this module existed, Apostrophe patched this into
  // the mongodb collection prototype
  newCollection.findWithProjection = newCollection.find;
  const superFindOne = collection.findOne;
  newCollection.findOne = function(criteria, projection, callback) {
    if (projection && ((typeof projection) === 'object')) {
      if (callback) {
        return superFindOne.call(collection, criteria, { projection: projection }, callback);
      } else {
        return superFindOne.call(collection, criteria, { projection: projection });
      }
    } else {
      callback = projection;
      if (callback) {
        return superFindOne.call(collection, criteria, callback);
      } else {
        return superFindOne.call(collection, criteria);
      }
    }
  };
  const superAggregate = collection.aggregate;
  newCollection.aggregate = function(op1 /* , op2... */, callback) {
    const last = arguments.length && arguments[arguments.length - 1];
    // Bring back support for operations as a variable number of
    // parameters rather than as an array
    if (Array.isArray(op1)) {
      // Array of aggregate stages
      if ((typeof last) === 'function') {
        // 2.x driver supported passing a callback rather than
        // returning a cursor, 3.x driver does not
        return superAggregate.call(collection, op1).toArray(last);
      } else {
        return superAggregate.apply(collection, arguments);
      }
    } else {
      // Positional arguments as aggregate stages (2.x supports, 3.x does not)
      if ((typeof last) === 'function') {
        // 2.x driver supported passing a callback rather than
        // returning a cursor, 3.x driver does not
        return superAggregate.call(collection, Array.prototype.slice.call(arguments, 0, arguments.length - 1)).toArray(last);
      } else {
        return superAggregate.call(collection, Array.prototype.slice.call(arguments));
      }
    }
  };
 return newCollection;
}

function decorateCursor(cursor) {
  const newCursor = decorate(cursor);
  newCursor.nextObject = newCursor.next;
  return newCursor;
}

// TODO: https://github.com/mongodb/node-mongodb-native/blob/master/CHANGES_3.0.0.md#bulkwriteresult--bulkwriteerror (we don't use it)
// https://github.com/mongodb/node-mongodb-native/blob/master/CHANGES_3.0.0.md#mapreduce-inlined-results (we don't use it)
// See others on that page


