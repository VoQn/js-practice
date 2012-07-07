'use strict';

var O = require('./object'),
    supplement = O.supplement,
    show = O.show;
/**
 * @param {*} fst first value of pair.
 * @param {*} snd second value of pair.
 * @constructor
 */
function Tuple(fst, snd) {
  this.fst = supplement(null, fst);
  this.snd = supplement(null, snd);
}

Tuple.prototype = {
  /**
   * @this {Tuple}
   * @return {string} expression.
   * @override
   */
  toString: function() {
    return '(' + show(this.fst) + ', ' + show(this.snd) + ')';
  }
};

function tuple(fst, snd) {
  return new Tuple(fst, snd);
}

if (typeof exports !== 'undefined') {
  /** @type {function(*, *): Tuple} */
  exports.Tuple = Tuple;

  /** @type {function(*, *): Tuple */
  exports.tuple = tuple;
}
// EOF
