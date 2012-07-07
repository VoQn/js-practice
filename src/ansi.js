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
  GRAY: 37
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
 * @param {string} color ANSI color code.
 * @return {string} ANSI colored text.
 */
function wrap(str, color) {
  return PREFIX + '[' + color + 'm' +
         str +
         PREFIX + '[0m';
}

if (typeof exports !== 'undefined') {
  /** @type {string} */
  exports.PREFIX = PREFIX;

  /** @type {Object.<string, number>} */
  exports.COLOR = COLOR;

  /** @type {Object.<string, string>} */
  exports.MARK_CHAR = MARK_CHAR;

  /** @type {function(string, string): string} */
  exports.wrap = wrap;
}
// EOF
