'use strict';

var R, Result,
    ANSI, MARK_CHAR;

if (require) {
  R = require('./result'),
  ANSI = require('./ansi');
  Result = R.Result;
  MARK_CHAR = ANSI.MARK_CHAR;
}

/**
 * @constructor
 */
function TestView() {
  /** @type {number} */
  this.countSuccess = 0;

  /** @type {number} */
  this.countFailed = 0;

  /** @type {number} */
  this.countError = 0;

  /** @type {Array.<string> */
  this.logBuffer = [];
}

function highlightResult(r) {
  if (!r.success) {
    if (r.exception) {
      return '>> ' +
           ANSI.wrap('error | ', ANSI.COLOR.RED) +
           ANSI.wrap(r.exception.stack, ANSI.COLOR.RED);
    }
    return '>> ' +
           ANSI.wrap('expected | ', ANSI.COLOR.YELLOW) +
           ANSI.wrap(r.expected,
                     ANSI.COLOR.YELLOW,
                     ANSI.OPTION.BRIGHT) + '\n   ' +
           ANSI.wrap('but got  | ', ANSI.COLOR.YELLOW) +
           ANSI.wrap(r.actual,
                     ANSI.COLOR.YELLOW,
                     ANSI.OPTION.BRIGHT);
  }
}

TestView.prototype = {
  /**
   * @this {TestView}
   * @return {TestView} formated test view.
   */
  clear: function() {
    this.countSuccess = 0;
    this.countFailed = 0;
    this.countError = 0;
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
    var mark, log;
    if (r.success) {
      this.countSuccess++;
      mark = MARK_CHAR.PASSED;
      log = ANSI.wrap(l, ANSI.COLOR.GREEN);
    } else if (r.exception) {
      this.countError++;
      mark = MARK_CHAR.FAILED;
      log = ANSI.wrap(l, ANSI.COLOR.RED) + '\n' +
            highlightResult(r);
    } else {
      this.countFailed++;
      mark = MARK_CHAR.FAILED;
      log = ANSI.wrap(l, ANSI.COLOR.YELLOW) + '\n' +
            highlightResult(r);
    }
    this.logBuffer.push(mark + ' ' + log);
    return {
      mark: mark,
      log: log
    };
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
        countError = 0,
        keys = Object.keys(res),
        last_index = this.logBuffer.length - 1,
        i, l, key, r, log, suite_label, c, o, prefix;
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      r = res[key];
      if (r.success) {
        countSuccess++;
        c = ANSI.COLOR.GREEN;
      } else if (r.exception) {
        countError++;
        c = ANSI.COLOR.RED;
      } else {
        countFailed++;
        c = ANSI.COLOR.RED;
      }
      o = this._simple_logging(key, r);
      this.logBuffer[last_index + i + 1] = '  ' + o.mark + ' ' +
        ANSI.wrap(o.log.replace(/\n/g, '\n    '), c);
    }
    if (countError) {
      suite_label = ANSI.wrap(MARK_CHAR.RAIN, ANSI.COLOR.CYAN) +
        ' ' + label + ': ' +
        (countSuccess ? 'passed ' + countSuccess + ', ' : '') +
        (countFailed ? 'failed ' + countFailed + ', ' : '') +
        'error ' + countError + ' case';
    } else if (countFailed) {
      suite_label = ANSI.wrap(MARK_CHAR.CLOUD, ANSI.COLOR.CYAN) +
        ' ' + label + ': failed ' + countFailed + ' case';
    } else {
      suite_label = ANSI.wrap(MARK_CHAR.SUN, ANSI.COLOR.YELLOW) +
        ' ' + label + ': passed ' + countSuccess + ' case';
    }
    this.logBuffer.splice(last_index + 1, 0, suite_label);
  },
  /**
   * output to console
   * @this {TestView}
   * @return {TextView} itself.
   */
  dump: function() {
    var header, status;
    if (this.countError) {
      header = MARK_CHAR.FAILED + ' ' +
        ANSI.wrap('Error',
                   ANSI.COLOR.RED,
                   ANSI.OPTION.BRIGHT);
      status = (this.countSuccess ?
                  this.countSuccess + ' passed, ' :
                  '') +
               this.countFailed + ' failed, ' +
               this.countError + ' error';

    } else if (this.countFailed) {
      header = MARK_CHAR.FAILED + ' ' +
        ANSI.wrap('Failed',
                   ANSI.COLOR.YELLOW,
                   ANSI.OPTION.BRIGHT);
      status = (this.countSuccess ?
                  this.countSuccess + ' passed, ' :
                  '') +
               this.countFailed + ' failed';
    } else {
      header = MARK_CHAR.PASSED + ' ' +
        ANSI.wrap('OK',
                   ANSI.COLOR.GREEN,
                   ANSI.OPTION.BRIGHT);
      status = ANSI.wrap(this.countSuccess,
                         ANSI.COLOR.WHITE,
                         ANSI.OPTION.BRIGHT) +
               ' passed';
    }
    console.log(this.logBuffer.join('\n') + '\n\n' +
        header + ' >> ' + status);
    return this;
  }
};

if (typeof exports !== 'undefined') {
  /** @type {function(): TestView} */
  exports.TestView = TestView;
}
