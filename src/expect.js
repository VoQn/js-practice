'use strict';

var O, supplement, isPrimitive, asArray, deepEq;

if (require) {
  O = require('./object');
  supplement = O.supplement;
  isPrimitive = O.isPrimitive;
  asArray = O.asArray;
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
 * @param {(*)=} opt_args
 * @constructor
 */
function Expect(subject, opt_args) {
  if (subject === undefined) {
    throw new Error('constructor Expect require subject parameter');
  }
  this.subject = subject;
  this.args = supplement([], opt_args);
}

/**
 * @return {string}
 * @override
 */
Expect.prototype.toString = function () {
  var t = typeof this.subject, expr, v;
  if (t === 'function') {
    return 'Expected<{' + t + '} (' + (this.args.length === 0 ? this.args : '') + ')>';
  }
  expr = isPrimitive(this.subject) ? t : this.subject.constructor.name;
  v = this.subject.toString();
  return 'Expected<{' + expr + '}: ' + v + '>';
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
  var actual;
  if (this.args) {
    actual = this.subject.apply(null, this.args);
  } else {
    actual = this.subject;
  }
  return _eq(expected, actual);
};

/**
 * @param {...*} var_args
 * @return Expect
 */
Expect.prototype.when_apply = function(var_args) {
  this.args = asArray(arguments);
  return this;
};

/**
 * @param {Error} error
 * @return {Result}
 */
Expect.prototype.to_throw = function(error) {
  var applied;
  try {
    if (this.args) {
      applied = this.subject.apply(null, this.args);
    } else {
      applied = this.subject();
    }
    return result({
      success: false,
      expected: error,
      actual: applied,
      reason: 'expected throw exception. but nothing thrown.'
    });
  } catch (e) {
    var is_eq = e instanceof error;
    return result({
      success: is_eq,
      expected: error,
      actual: e,
      reason: is_eq ? 'expected error catch' : 'unexpected error',
      exception: e
    });
  }
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
  var actual;
  if (this.args) {
    actual = this.subject.apply(null, this.args);
  } else {
    actual = this.subject;
  }
  var r = _eq(expected, actual);
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
