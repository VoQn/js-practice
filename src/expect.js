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

/**
 * @param {*} target object.
 * @param {Object} expects test suite.
 * @constructor
 */
function Subject(target, expects) {
  this.target = target;
  this.expects = expects;
}

Subject.prototype = {
  /**
   * @this {Subject}
   * @return {string} expression of instance.
   * @override
   */
  toString: function() {
    return 'Subject { target:' +
            this.target +
            ', expects: ' +
            this.expects +
            '}';
  },
  /**
   * @this {Subject}
   * @return {Object} results of test suite.
   */
  evaluate: function() {
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

/*
 * factory function for Expect instance
 */
function subject(target, expects) {
  return new Subject(target, expects);
}

if (typeof exports !== 'undefined') {
  /** @type {function(*, Array):Expect} */
  exports.expect = expect;

  /** @type {function(boolean, *, *, string, Error):Result} */
  exports.Result = Result;

  /** @type {function(boolean, *, *, string, Error):Result} */
  exports.result = result;

  /** @type {function(*, Object):Subject} */
  exports.Subject = Subject;

  /** @type {function(*, Object):Subject} */
  exports.subject = subject;
}

// EOF
