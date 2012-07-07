'use strict';

var E, expect,
    S, Subject,
    R, Result, result,
    TestView;

if (require) {
  E = require('./expect');
  S = require('./subject');
  R = require('./result');
  TestView = require('./testView').TestView;
  Subject = S.Subject;
  expect = E.expect;
  Result = R.Result;
  result = R.result;
}

/**
 * @param {string} label of test case.
 * @param {(function():Result)|Subject} test callback or test subject.
 * @constructor
 */
function TestCase(label, test) {
  this.label = label;
  this.test = test;
}

TestCase.prototype = {
  toString: function() {
    return 'TestCase { label: ' +
      this.label + ', test: ' + this.test + ' }';
  },
  /**
   * @this {TestCase}
   * @return {Result} of evaluated test case.
   */
  evaluate: function() {
    try {
      if (this.test instanceof Subject) {
        return this.test.evaluate();
      }
      if (this.test instanceof Result) {
        return this.test;
      }
      if (typeof this.test === 'function') {
        return this.test();
      }
      return this.test;
    } catch (e) {
      return result({
        success: false,
        expected: null,
        actual: null,
        reason: 'Exception Occured',
        exception: e
      });
    }
  }
};

/*
 * factory function for TestCase instance
 */
function testCase(label, test) {
  return new TestCase(label, test);
}

/**
 * @param {Array|Object} test_cases array or hash.
 * @return {Array.<TestCase>} test suite.
 */
function testGroup(test_cases) {
  var i, l, labels, label, suite = [], t_case;
  if (Array.isArray(test_cases)) {
    for (i = 0, l = test_cases.length; i < l; i++) {
      suite[i] = testCase('case_' + i, test_cases[i]);
    }
    return suite;
  }
  // test_cases is Object<string, ((function():Result)|Subject)>
  labels = Object.keys(test_cases);
  for (i = 0, l = labels.length; i < l; i++) {
    label = labels[i];
    t_case = test_cases[label];
    suite[i] = testCase(label, t_case);
  }
  return suite;
}

/**
 * @param {Array.<TestCase>} test_suite hash object.
 * @return {Array.<Result>} for each evaluated value from test_suites.
 */
function runTests(test_suite) {
  var i, l, rs = [], view = new TestView();
  for (i = 0, l = test_suite.length; i < l; i++) {
    rs[i] = test_suite[i].evaluate();
    view.logging(test_suite[i].label, rs[i]);
  }
  view.dump();
  return rs;
}

if (typeof exports !== 'undefined') {
  /** @type {function():Array} */
  exports.runTests = runTests;

  /** @type {function(string, (function():Result|Subject)): TestCase} */
  exports.testCase = testCase;

  /** @type {function(Array.<TestCase>):Array.<Result>} */
  exports.testGroup = testGroup;
}
