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

  /** @type {Array.<string> */
  this.logBuffer = [];
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
        log = success ? l :
              l + '\n' +
              r.toString().replace(/(\{|,|\})/g, '\n').replace(/:/g, '\t| ');
    if (success) {
      this.countSuccess++;
      color = ANSI.COLOR.GREEN;
    } else {
      this.countFailed++;
      color = ANSI.COLOR.RED;
    }
    this.logBuffer.push(prefix + ' ' + ANSI.wrap(log, color));
    return {
      mark: prefix,
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
        keys = Object.keys(res),
        last_index = this.logBuffer.length - 1,
        i, l, key, r, log, suite_label, c, o, prefix;
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      r = res[key];
      if (r.success) {
        countSuccess++;
        c = ANSI.COLOR.GREEN;
      } else {
        countFailed++;
        c = ANSI.COLOR.RED;
      }
      o = this._simple_logging(key, r);
      this.logBuffer[last_index + i + 1] = '  ' + o.mark + ' ' +
        ANSI.wrap(o.log.replace(/\n/g, '\n    '), c);
    }
    if (countFailed) {
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
    var i, l, buffer = this.logBuffer;
    console.log(buffer.join('\n') + '\n\n' +
        'success | ' + this.countSuccess + '\n' +
        'failed  | ' + this.countFailed + '\n' +
        'total   | ' + (this.countSuccess + this.countFailed));
    return this;
  }
};

if (typeof exports !== 'undefined') {
  /** @type {function(): TestView} */
  exports.TestView = TestView;
}
