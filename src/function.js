;(function(root) {
  'use strict';
  var function_util = {};

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = function_util;
  } else {
    root.function_util = function_util;
  }

  var __slice = Array.prototype.slice;

  /**
   * @param {*} any value.
   * @return {*} any value.
   * @nosideeffects
   */
  function_util.id = function id(any) { return any; };

  /**
   * @param {*} any value.
   * @param {*} second argument.
   * @return {*} 2nd argument.
   * @nosideeffects
   */
  function_util.seq = function seq(any, second) { return second; };

  /**
   * @param {function():*} promise procedure.
   * @return {*} promise return value by promise.
   */
  function_util.force = function force(promise) { return promise(); };

  /**
   * @param {*} arg register for next function.
   * @param {...*} var_args for next function.
   * @return {function(function(...*):*):*} waiting callback with args.
   */
  function_util.apply = function apply(arg, var_args) {
    var args = __slice.call(arguments);
    return (args.length < 2) ?
      function(func) {
        return func(arg);
      } :
      function(func) {
        return func.apply(null, args);
      };
  };

  /**
   * @param {function(...*):*} func to curry.
   * @param {...*} var_args for callback.
   * @return {function(...*):*|*}
   * when var_args.length == func.length, return func(var_args),
   * otherwise curried function.
   */
  function_util.curry = function curry(func, var_args) {
    var require_length = func.length,
        args = arguments.length > 1 ? __slice.call(arguments, 1) : [],
        curried = function() {
          var args2 = __slice.call(arguments),
          appended = args.concat(args2);
          return curry.apply(null, [func].concat(appended));
        };

    if (require_length > args.length) {
      return curried;
    }
    return func.apply(null, args);
  };

})(this);
// EOF
