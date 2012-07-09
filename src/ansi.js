'use strict';

/** @const {string} */
var PREFIX = '\u001b';

/** @enum {number} */
var COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  PURPLE: 35,
  CYAN: 36,
  GRAY: 37,
  WHITE: 38
};

var OPTION = {
  BRIGHT: 1,
  REVERSE: 7
};

/** @enum {string} */
var MARK_CHAR = {
  PASSED: '\u2713',
  FAILED: '\u2718',
  SUN: '\u263c',
  CLOUD: '\u2601',
  RAIN: '\u2602'
};

/**
 * @param {string} str expression.
 * @param {number} color ANSI color code.
 * @param {number=} option ANSI decoration code.
 * @return {string} ANSI colored text.
 */
function wrap(str, color, option) {
  function codeMake(c) {
    return PREFIX + '[' + c + 'm';
  }
  return codeMake(color) + (option ? codeMake(option) : '') +
         str +
         codeMake(0);
}

if (typeof exports !== 'undefined') {
  /** @type {string} */
  exports.PREFIX = PREFIX;

  /** @type {Object.<string, number>} */
  exports.COLOR = COLOR;

  /** @type {Object.<string, number}>} */
  exports.OPTION = OPTION;

  /** @type {Object.<string, string>} */
  exports.MARK_CHAR = MARK_CHAR;

  /** @type {function(string, string): string} */
  exports.wrap = wrap;
}
// EOF
