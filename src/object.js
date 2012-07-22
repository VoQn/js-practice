;(function(root) {
  'use strict';
  var object_util = {},
      old_object_util = root.object_util;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = object_util;
  } else {
    root.object_util = object_util;
  }

  /**
   * @param {!Object} x value.
   * @return {boolean} parameter is empty object or not.
   */
  object_util.isEmpty = function(x) {
    return x === undefined ||
           x === null ||
           Object.keys(x).length === 0;
  };

  /**
   * @param {*} any value.
   * @return {boolean} x is an Array.
   */
  object_util.isArray = Array.isArray || function(any) {
    return Object.prototype.toString.call(any) === '[object Array]';
  };

  /**
   * @param {*} x any value.
   * @return {boolean} "typeof x" is Primitive.
   */
  object_util.isPrimitive = function(x) {
    if (x === null) {
      return true;
    }
    var type_expr = typeof x,
        primitives = ['undefined', 'boolean', 'number', 'string'],
        i = 0,
        l = primitives.length;
    for (; i < l; i++) {
      if (type_expr === primitives[i]) {
        return true;
      }
    }
    return false;
  };

  /**
   * @param {!Object} x any object.
   * @return {Object} copied new object.
   */
  object_util.clone = function(x) {
    var copied = Object.create(x),
        properties = Object.getOwnPropertyNames(x),
        i = 0,
        l = properties.length,
        name,
        descriptor;
    for (; i < l; i++) {
      name = properties[i];
      descriptor = Object.getOwnPropertyDescriptor(x, name);
      Object.defineProperty(copied, name, descriptor);
    }
    return copied;
  };

  /**
   * @param {*} default_value instead of opt_arg.
   * @param {*=} opt_arg argument by called original function.
   * @param {(function(*,*):*)=} opt_callback optional modifier.
   * @return {*} supplemented default value,
   * or value modified by optional callback.
   */
  object_util.supplement = function(default_value, opt_arg, opt_callback) {
    if (opt_arg === undefined) {
      return default_value;
    }
    if (opt_callback === undefined) {
      return opt_arg;
    }
    return opt_callback(default_value, opt_arg);
  };

  /**
   * @param {*} x any object.
   * @param {number=} opt_from slice begin index.
   * @param {number=} opt_to slice end index.
   * @return {Array} x to array.
   */
  object_util.asArray = function(x, opt_from, opt_to) {
    if (x === null || x === undefined || typeof x === 'function') {
      return [];
    }
    if (typeof x === 'string' && x === '') {
      return [];
    }
    if (object_util.isPrimitive(x)) {
      return [x];
    }
    var args = Array.prototype.slice.apply(x),
        from = object_util.supplement(0, opt_from, function(d, v) {
          return Math.min(v, args.length - 1);
        }),
        to = object_util.supplement(args.length, opt_to, function(d, v) {
          return Math.min(d, Math.max(0, v));
        });
    return args.slice(from, to);
  };

  /**
   * @param {*} any value.
   * @return {string} string expression.
   */
  object_util.show = function show(any) {
    if (typeof any === 'string') {
      return '"' + any + '"';
    }
    return '' + any;
  };

})(this);
// EOF
