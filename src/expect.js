'use strict';

if (require) {
  var supplement = require('./object').supplement,
      deepEq = require('./eq').deepEq;
}

/**
 * @param {boolean} success
 * @param {*} expected
 * @param {*} actual
 * @param {string} reason
 * @param {Error} exception
 * @constructor
 */
function Result(success, expected, actual, reason, exception) {
  this.success   = supplement(false, success);
  this.expected  = supplement(null, expected);
  this.actual    = supplement(null, actual);
  this.reason    = supplement('<nothing>', reason);
  this.exception = supplement(null, exception);
}

/**
 * @return {string}
 * @override
 */
Result.prototype.toString = function () {
  return 'Result { success:' + this.success +
                ', expected:' + this.expected +
                ', actual:' + this.actual +
                ', reason:' + this.reason +
                ', exception:' + (this.exception || 'none') +
                '}';
};

/**
 * @description factory function for Result instance
 * @param {Object} stub
 * @return {Result}
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

/**
 * @param {*} subject
 * @constructor
 */
function Expect(subject) {
  this.subject = subject;
}

/**
 * @return {string}
 * @override
 */
Expect.prototype.toString = function () {
  return 'Expected<{' + typeof this.subject + '}: ' + this.subject + '>';
};

/**
 * @param {function(*):Result} should
 * @return Result
 */
Expect.prototype.to = function(should) {
  return should(this.subject);
};

function _eq(expected, actual) {
  var is_eq = deepEq(expected, actual);
  return result({
    success: is_eq,
    expected: expected,
    actual: actual,
    reason: is_eq ? 'equal' : 'different',
    exception: null
  });
}

/**
 * @param {*} expected
 * @return Result
 */
Expect.prototype.to_eq = function(expected) {
  return _eq(expected, this.subject);
};

/**
 * @param {function(*):Result} should
 * @return Result
 */
Expect.prototype.not_to = function(should) {
  var r = should(this.subject);
  r.success = !r.success;
  return r;
};

/**
 * @param {*} expected
 * @return Result
 */
Expect.prototype.not_to_eq = function(expected) {
  var r = _eq(expected, this.subject);
  r.success = !r.success;
  return r;
};


/**
 * @description factory function for Expect instance
 * @param {*} subject
 * @return {Expect}
 */
function expect(subject) {
  return new Expect(subject);
}

if (typeof exports !== 'undefined') {
  exports.expect = expect;
  exports.result = result;
}

// EOF
