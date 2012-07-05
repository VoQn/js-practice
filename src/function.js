'use strict';

if (require) {
  var O = require('./object'),
      asArray = O.asArray;
}

/**
 * @param {*} any value.
 * @return {*} any value.
 * @nosideeffects
 */
function id(any) {
  return any;
}

/**
 * @param {*} any value.
 * @param {*} second argument.
 * @return {*} 2nd argument.
 * @nosideeffects
 */
function seq(any, second) {
  return second;
}

/**
 * @param {function():*} promise procedure.
 * @return {*} promise return value by promise.
 */
function force(promise) {
  return promise();
}

/**
 * @param {*} arg register for next function.
 * @param {...*} var_args for next function.
 * @return {function(function(...*):*):*} waiting callback with args.
 */
function apply(arg, var_args) {
  var args = asArray(arguments);
  function applies(func) {
    return func.apply(null, args);
  }
  function apply_one(func) {
    return func(arg);
  }
  if (args.length === 1) {
    return apply_one;
  }
  return applies;
}

/**
 * @param {function(...*):*} func to curry.
 * @param {...*} var_args for callback.
 * @return {function(...*):*|*}
 * when var_args.length == func.length, return func(var_args),
 * otherwise curried function.
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
  /** @type {function(*):*} */
  exports.id = id;

  /** @type {function(*,*):*} */
  exports.seq = seq;

  /** @type {function(function():*):*} */
  exports.force = force;

  /** @type {function(*, ...*):(function(...*):*)} */
  exports.apply = apply;

  /** @type {function(function(...*), ...*):*|function(...*):*} */
  exports.curry = curry;
}
// EOF
