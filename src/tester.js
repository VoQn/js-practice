'use strict';

var E, S, Subject, expect, R, Result, result;

if (require) {
  E = require('../src/expect');
  S = require('../src/subject');
  R = require('../src/result');
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

var ANSI_COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  PURPLE: 35,
  CYAN: 36,
  GRAY: 37
};

var MARK_CHAR = {
  PASSED: '\u2713',
  FAILED: '\u2718',
  SUN: '\u263c',
  CLOUD: '\u2601',
  RAIN: '\u2602'
};

function wrapColor(str, color) {
  var ansi_prefix = '\u001b',
      suffix = ansi_prefix + '[0m';
  return ansi_prefix + '[' + color + 'm' + str + suffix;
}

/**
 * @constructor
 */
function TestView() {
  return this.clear();
}

TestView.prototype = {
  /**
   * @this {TestView}
   * @return {TestView} formated test view.
   */
  clear: function() {
    this.countSuccess = 0;
    this.countFailed = 0;
    this.logBuffer = [];
    return this;
  },
  /**
   * @this {TestView}
   * @param {string} l label of test case.
   * @param {Result} r result of test case.
   * @return {string} test log.
   */
  _simple_logging: function(l, r) {
    var color,
        success = r.success,
        prefix = success ? MARK_CHAR.PASSED : MARK_CHAR.FAILED,
        log = prefix + ' ' +
            (success ? l :
              l + '\n' +
              r.toString().replace(/(\{|,|\})/g, '\n').replace(/:/g, '\t| ')
            );
    if (success) {
      this.countSuccess++;
      color = ANSI_COLOR.GREEN;
    } else {
      this.countFailed++;
      color = ANSI_COLOR.RED;
    }
    this.logBuffer.push(wrapColor(log, color));
    return log;
  },
  /**
   * @this {TestView}
   * @param {string} l label of test case.
   * @param {Result|Object.<string, Result>} r result of test case,
   * or results of test suites.
   */
  logging: function(label, res) {
    if (res instanceof Result) {
      this._simple_logging(label, res);
      return;
    }
    var countSuccess = 0,
        countFailed = 0,
        keys = Object.keys(res),
        last_index = this.logBuffer.length - 1,
        i, l, key, r, log, suite_label, c, prefix;
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      r = res[key];
      if (r.success) {
        countSuccess++;
        c = ANSI_COLOR.GREEN;
      } else {
        countFailed++;
        c = ANSI_COLOR.RED;
      }
      log = this._simple_logging(key, r);
      this.logBuffer[last_index + i + 1] = '  ' +
        wrapColor(log.replace(/\n/g, '\n    '), c);
    }
    if (countFailed) {
      suite_label = wrapColor(
          MARK_CHAR.CLOUD + ' ' + label +
          ': failed ' + countFailed + ' case',
          ANSI_COLOR.YELLOW);
    } else {
      suite_label = wrapColor(
          MARK_CHAR.SUN + ' ' + label +
          ': passed ' + countSuccess + ' case',
          ANSI_COLOR.GREEN);
    }
    this.logBuffer.splice(last_index + 1, 0, suite_label);
  },
  /**
   * output to console
   * @this {TestView}
   * @return {TextView} itself.
   */
  dump: function() {
    var i, l, buffer = this.logBuffer;
    console.log(buffer.join('\n') + '\n\n' +
        'success | ' + this.countSuccess + '\n' +
        'failed  | ' + this.countFailed + '\n' +
        'total   | ' + (this.countSuccess + this.countFailed));
    return this;
  }
};

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
