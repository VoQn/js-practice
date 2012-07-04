'use strict';

if (require) {
  var expect_module = require('../src/expect'),
      expect = expect_module.expect,
      eq = expect_module.eq,
      result = expect_module.result;
}

/**
 * @param {string} label
 * @param {function():Result} test
 * @constructor
 */
function TestCase(label, test) {
  this.label = label;
  this.test = test;
}

/**
 * @return {Result}
 */
TestCase.prototype.evaluate = function () {
  try {
    return this.test();
  } catch (e) {
    return result({
      success: false,
      expected: null,
      actual: null,
      reason: 'Exception Occured',
      exception: e
    });
  }
};

/**
 * @description factory function for TestCase instance
 * @return {TestCase}
 */
function testCase(label, test) {
  return new TestCase(label, test);
}

/**
 * @param {Array|Object} test_cases
 * @return {Array.<TestCase>}
 */
function testGroup(test_cases) {
  var i, l, labels, suite = [];
  if (Array.isArray(test_cases)) {
    for (i = 0, l = test_cases.length; i < l; i++) {
      suite[i] = new TestCase('case_' + i, test_cases[i]);
    }
    return suite;
  }
  // test_cases is Object<string, function():Result>
  labels = Object.keys(test_cases);
  for (i = 0, l = labels.length; i < l; i++) {
    suite[i] = new TestCase(labels[i], test_cases[labels[i]]);
  }
  return suite;
}

/**
 * @constructor
 */
function TestView() {
  return this.clear();
}

TestView.prototype = {
  /**
   * @return {TestView}
   */
  clear: function () {
    this.countSuccess = 0;
    this.countFailed = 0;
    this.logBuffer = [];
    return this;
  },
  /**
   * @param {string} l
   * @param {Result} r
   * @return {string}
   */
  logging: function (l, r) {
    var ansi_prefix = '\u001b',
        suffix = ansi_prefix + '[0m',
        success = r.success,
        prefix = ansi_prefix + (success ? '[32m\u2713' : '[31m\u2718') + ' ',
        log = success ? l + ';' :
                l +
                  '\nreason: ' + r.reason + '\n' +
                  (r.exception ?
                    ('exception: ' + r.exception) :
                    ('  expected: ' + r.expected + '\n' +
                     '  but got: ' + r.actual + '\n'));
    if (success) {
      this.countSuccess++;
    } else {
      this.countFailed++;
    }
    this.logBuffer.push(prefix + log + suffix);
    return log;
  },
  /**
   * @description output to console
   * @return {TextView}
   */
  dump: function () {
    var i, l, buffer = this.logBuffer;
    console.log(buffer.join('\n') + '\n\n' +
        'success: ' + this.countSuccess +
        ', failed: ' + this.countFailed +
        ', total: ' + (this.countSuccess + this.countFailed));
    return this;
  }
};

/**
 * @description evaluate for each Test Suites
 * @param {Array.<TestCase>} test_suites
 * @return {Array.<Result>}
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
  exports.runTests = runTests;
  exports.testCase = testCase;
  exports.testGroup = testGroup;
}
