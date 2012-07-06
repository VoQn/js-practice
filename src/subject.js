'use strict';

var E, expect;

if (require) {
  E = require('./expect');
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
  /** @type {function(*, Object):Subject} */
  exports.Subject = Subject;

  /** @type {function(*, Object):Subject} */
  exports.subject = subject;
}

// EOF
