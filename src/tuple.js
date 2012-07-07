'use strict';

var O = require('./object'),
    supplement = O.supplement;

function Tuple(fst, snd) {
  this.fst = supplement(null, fst);
  this.snd = supplement(null, snd);
}

Tuple.prototype = {
  toString: function() {
    return '(' + this.fst + ', ' + this.snd + ')';
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