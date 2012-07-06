'use strict';

var O, asArray,
    E, expect;

if (require) {
  O = require('./object');
  E = require('./expect');
  asArray = O.asArray;
  expect = E.expect;
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
        i, l, key, exp;
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      exp = this.expects[key];
      if (exp instanceof Topic) {
        rs[key] = exp.apply(topic);
      } else if (typeof exp === 'function') {
        rs[key] = exp(topic.when_apply.bind(topic));
      } else {
        rs[key] = exp;
      }
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

/**
 * @param {Array} parameter for test subject.
 * @constructor
 */
function Topic(parameter) {
  this.parameter = parameter;
  /** @type {function(Expect):Result} */
  this.current_callback = null;
}

Topic.prototype = {
  toString: function() {
    return 'Topic {' +
      ' parameters: [' + this.parameter + '],' +
      ' current_callback: ' + this.current_callback + '}';
  },
  apply: function(sbj) {
    if (this.current_callback) {
      return this.current_callback(sbj);
    }
  },
  to_throw: function(error) {
    var args = this.parameter;
    this.current_callback = function(sbj) {
      return sbj.when_apply.apply(sbj, args).to_throw(error);
    }
    return this;
  },
  to_be: function(expected) {
    var args = this.parameter;
    this.current_callback = function(sbj) {
      return sbj.when_apply.apply(sbj, args).to_be(expected);
    };
    return this;
  },
  not_to_be: function(unexpected) {
    var args = this.parameter;
    this.current_callback = function(sbj) {
      return sbj.when_apply.apply(sbj, args).not_to_be(unexpected);
    }
  }
};

function topic(var_args) {
  return new Topic(asArray(arguments));
}

if (typeof exports !== 'undefined') {
  /** @type {function(*, Object):Subject} */
  exports.Subject = Subject;

  /** @type {function(*, Object):Subject} */
  exports.subject = subject;

  /** @type {function(*):Topic} */
  exports.topic = topic;
}
// EOF
