
'use strict';

/**
 * @param {!Object} x
 * @return {boolean} parameter is empty object or not
 */
function isEmpty(x) {
  return x === undefined ||
         x === null ||
         Object.keys(x).length === 0;
}

/**
 * @return {function(*):boolean} argument value is Array or not
 */
function init_isArray() {
  if (Array.isArray) {
    return Array.isArray;
  }
  var isArray = function isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
  return isArray;
}

/**
 * @param {*} x
 * @return {boolean} x is an Array
 */
var isArray = init_isArray();

/**
 * @param {*} x
 * @return {boolean} "typeof x" is Primitive
 */
function isPrimitive(x) {
  if (x === null) {
    return true;
  }
  var type_expr = typeof x,
      primitives = [
        'undefined', 'boolean', 'number', 'string'
      ],
      i, l;
  for (i = 0, l = primitives.length; i < l; i++) {
    if (type_expr === primitives[i]) {
       return true;
    }
  }
  return false;
}

/**
 * @description Object clone
 * @param {!Object} x
 * @return {Object}
 */
function clone(x) {
  var copied = Object.create(x),
      properties = Object.getOwnPropertyNames(x),
      i, l, name, descriptor;
  for (i = 0, l = properties.length; i < l; i++) {
    name = properties[i];
    descriptor = Object.getOwnPropertyDescriptor(x, name);
    Object.defineProperty(copied, name, descriptor);
  }
  return copied;
}

/**
 * @description supplement default value or value modified by optional callback
 * @param {*} default_value
 * @param {*=} opt_arg
 * @param {(function(*,*):*)=} opt_callback
 * @return {*}
 */
function supplement(default_value, opt_arg, opt_callback) {
  if (opt_arg === undefined) {
    return default_value;
  }
  if (opt_callback === undefined) {
    return opt_arg;
  }
  return opt_callback(default_value, opt_arg);
}

/**
 * @param {*} x
 * @param {number=} opt_from
 * @param {number=} opt_to
 * @return {Array}
 */
function asArray(x, opt_from, opt_to) {
  if (x === null || x === undefined || typeof x === 'function') {
    return [];
  }
  if (typeof x === 'string' && x === '') {
    return [];
  }
  if (isPrimitive(x)) {
    return [x];
  }
  var args = Array.prototype.slice.apply(x),
      from = supplement(0, opt_from, function (d, v) {
        return Math.min(v, args.length - 1);
      }),
      to = supplement(args.length, opt_to, function (d, v) {
        return Math.min(d, Math.max(0, v));
      });
  return args.slice(from, to);
}


if (typeof exports !== 'undefined') {
  exports.isEmpty = isEmpty;
  exports.isArray = isArray;
  exports.isPrimitive = isPrimitive;
  exports.clone = clone;
  exports.supplement = supplement;
  exports.asArray = asArray;
}
// EOF
