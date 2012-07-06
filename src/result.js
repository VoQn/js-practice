'use strict';

var O, supplement;

if (require) {
  O = require('../src/object');
  supplement = O.supplement;
}

/**
 * @param {boolean} success succeeded or not.
 * @param {*} expected return value.
 * @param {*} actual return value.
 * @param {string} reason why test was succeeded or failed.
 * @param {Error} exception thrown.
 * @constructor
 */
function Result(success, expected, actual, reason, exception) {
  this.success = supplement(false, success);
  this.expected = supplement(null, expected);
  this.actual = supplement(null, actual);
  this.reason = supplement('<nothing>', reason);
  this.exception = supplement(null, exception);
}

/**
 * @return {string} expression of instance.
 * @override
 */
Result.prototype.toString = function() {
  return 'Result { success:' + this.success +
                ', expected:' + this.expected +
                ', actual:' + this.actual +
                ', reason:' + this.reason +
                ', exception:' + (this.exception || 'none') +
                '}';
};

/**
 * @param {Object} stub parameter hash.
 * @return {Result} instance from stub parameter.
 */
function result(stub) {
  var r = new Result(),
      keys = Object.keys(stub),
      i, k, l;
  for (i = 0, l = keys.length; i < l; i++) {
    k = keys[i];
    r[k] = stub[k];
  }
  return r;
}

if (typeof exports !== 'undefined') {
  /** @type {function(boolean, *, *, string, Error):Result} */
  exports.Result = Result;

  /** @type {function(boolean, *, *, string, Error):Result} */
  exports.result = result;
}
// EOF
