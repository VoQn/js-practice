'use strict';

var O, supplement, isPrimitive, asArray,
    Eq, deepEq,
    R, result;

if (require) {
  O = require('./object');
  R = require('./result');
  Eq = require('./eq');
  supplement = O.supplement;
  isPrimitive = O.isPrimitive;
  asArray = O.asArray;
  result = R.result;
  deepEq = Eq.deepEq;
}

/**
 * @param {*} subject of test case.
 * @param {Array=} opt_args if subject if a function, applied this.
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
   * @this {Expect}
   * @return {string} expression of instance.
   * @override
   */
  toString: function() {
    var t = typeof this.subject, expr, v;
    if (t === 'function') {
      return 'Expected<{' + t +
          '} (' +
             (this.args.length === 0 ? this.args : '') +
          ')>';
    }
    expr = isPrimitive(this.subject) ? t : this.subject.constructor.name;
    v = this.subject.toString();
    return 'Expected<{' + expr + '}: ' + v + '>';
  },
  /**
   * @this {Expect}
   * @param {...*} var_args apply as argument of subject function.
   * @return {Expect} itself.
   */
  when_apply: function(var_args) {
    this.args = asArray(arguments);
    return this;
  },
  /**
   * @this {Expected}
   * @param {Error} error object should thrown.
   * @return {Result} error has been thrown or not.
   */
  to_throw: function(error) {
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
   * @this {Expected}
   * @param {*} expected value.
   * @return {Result} subject has been expected value or not.
   */
  to_be: function(expected) {
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
   * @this {Expected}
   * @param {*} unexpected value.
   * @return {Result} subject has been not expected value.
   */
  not_to_be: function(unexpected) {
    var r = this.to_be(unexpected);
    if (!r.exception) {
      r.success = !r.success;
    }
    return r;
  }
};

/*
 * factory function for Expect instance
 */
function expect(subject, opt_args) {
  return new Expect(subject, opt_args);
}

if (typeof exports !== 'undefined') {
  /** @type {function(*, Array):Expect} */
  exports.expect = expect;
}
// EOF
