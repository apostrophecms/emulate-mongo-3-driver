const toEmulate = Symbol.for('@@mdb.callbacks.toEmulate');

const wrapMaybeCallback = (promise, callback, wrap = (result) => result) => {
  if (callback) {
    promise.then(
      result => callback(undefined, wrap(result)),
      error => callback(error)
    );

    return;
  }

  return promise.then(
    result => wrap(result),
    error => { throw error }
  );
};

module.exports = {
  toEmulate,
  wrapMaybeCallback
}
