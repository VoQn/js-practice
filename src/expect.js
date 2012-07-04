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

Expect.prototype = {
  /**
   * @return {string}
   * @override
   */
  toString: function () {
    var t = typeof this.subject, expr, v;
    if (t === 'function') {
      return 'Expected<{' + t + '} (' + (this.args.length === 0 ? this.args : '') + ')>';
    }
    expr = isPrimitive(this.subject) ? t : this.subject.constructor.name;
    v = this.subject.toString();
    return 'Expected<{' + expr + '}: ' + v + '>';
  },
  /**
   * @param {...*} var_args
   * @return Expect
   */
  when_apply: function (var_args) {
    this.args = asArray(arguments);
    return this;
  },
  /**
   * @param {Error} error
   * @return {Result}
   */
  to_throw: function (error) {
    var applied;
    try {
      if (this.args.length) {
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
  },
  /**
   * @param {*} expected
   * @return {Result}
   */
  to_be: function (expected) {
    var actual = null,
        exception = null,
        success = false,
        reason = '';
    if (typeof this.subject === 'function' && this.args.length) {
      try {
        actual = this.subject.apply(null, this.args);
        success = deepEq(expected, actual);
        reason = success ? 'same' : 'different';
      } catch (e) {
        exception = e;
        reason = 'unexpected exception: (' + e + ')';
      }
    } else {
      actual = this.subject;
      success = deepEq(expected, actual);
      reason = success ? 'same' : 'different';
    }
    return result({
      success: success,
      expected: expected,
      actual: actual,
      reason: reason,
      exception: exception
    });
  },
  /**
   * @param {*} expected
   * @return {Result}
   */
  not_to_be: function (expected) {
    var r = this.to_be(expected);
    if (!r.exception) {
      r.success = !r.success;
    }
    return r;
  }
};

/**
 * @description factory function for Expect instance
 * @param {*} subject
 * @return {Expect}
 */
function expect(subject) {
  return new Expect(subject);
}

function Subject(target, expects) {
  this.target = target;
  this.expects = expects;
}

Subject.prototype = {
  /**
   * @return {string}
   * @override
   */
  toString: function () {
    return 'Subject { target:' +
            this.target +
            ', expects: ' +
            this.expects +
            '}';
  },
  evaluate: function () {
    var topic = expect(this.target),
        keys = Object.keys(this.expects),
        rs = {},
        i, l, key;
    if (typeof this.target === 'function') {
      topic = topic.when_apply.bind(topic);
    }
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      rs[key] = this.expects[key](topic);
    }
    return rs;
  }
};

function subject(target, expects) {
  return new Subject(target, expects);
}

if (typeof exports !== 'undefined') {
  exports.expect = expect;
  exports.Result = Result;
  exports.result = result;
  exports.Subject = Subject;
  exports.subject = subject;
}

// EOF
