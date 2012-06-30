'use strict';

if (require) {
  var O = require('./object'),
      asArray = O.asArray;
}

/**
 * @param {*} x
 * @return {*}
 * @nosideeffects
 */
function id(x) {
  return x;
}

/**
 * @param {*} x
 * @param {*} y
 * @return {*}
 * @nosideeffects
 */
function seq(x, y) {
  return y;
}

/**
 * @param {function():*} promise
 * @return {*}
 */
function force(promise) {
  return promise();
}

/**
 * @param {*} arg
 * @param {...*} var_args
 * @return {function(function(...*):*):*}
 */
function apply(arg, var_args) {
  var args = asArray(arguments);
  function applies (func) {
    return func.apply(null, args);
  }
  function apply_one (func) {
    return func(arg);
  }
  if (args.length === 1) {
    return apply_one;
  }
  return applies;
}

/**
 * @param {function(...*):*} func
 * @param {...*} var_args
 * @return {function(...*):*|*}
 */
function curry(func, var_args) {
  var l = func.length,
      args = arguments.length < 2 ? [] : asArray(arguments, 1);
  function curried() {
    var args2 = asArray(arguments),
        appended = args.concat(args2);
    return curry.apply(null, [func].concat(appended));
  }
  if (l > args.length) {
    return curried;
  }
  return func.apply(null, args);
}

if (typeof exports !== 'undefined') {
  exports.id = id;
  exports.seq = seq;
  exports.force = force;
  exports.apply = apply;
  exports.curry = curry;
}
// EOF
