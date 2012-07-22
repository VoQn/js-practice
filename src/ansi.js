;(function(root) {

  'use strict';
  var ansi = {},
      old_ansi = root.ansi;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ansi;
  } else {
    root.ansi = ansi;
  }

  ansi.noConflict = function() {
    root.ansi = old_ansi;
    return ansi;
  };

  /** @const {string} */
  ansi.PREFIX = '\u001b';

  /** @enum {number} */
  ansi.COLOR = {
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

  ansi.OPTION = {
   BRIGHT: 1,
   REVERSE: 7
 };

 /** @enum {string} */
 ansi.MARK_CHAR = {
   PASSED: '\u2713',
   FAILED: '\u2718',
   SUN: '\u2600',
   CLOUD: '\u2601',
   RAIN: '\u2602'
 };

 var _codeMake = function(codeKey) {
   return ansi.PREFIX + '[' + codeKey + 'm';
 };

 /**
  * @param {string} str expression.
  * @param {number} color ANSI color code.
  * @param {number=} option ANSI decoration code.
  * @return {string} ANSI colored text.
  */
 ansi.wrap = function(str, color, option) {
  return _codeMake(color) +
    (option ? _codeMake(option) : '') +
    str +
    _codeMake(0);
 };

})(this);
// EOF
