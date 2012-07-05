
'use strict';

/**
 * @param {!Object} x value.
 * @return {boolean} parameter is empty object or not.
 */
function isEmpty(x) {
  return x === undefined ||
         x === null ||
         Object.keys(x).length === 0;
}

/**
 * @return {function(*):boolean} argument value is Array or not.
 */
function init_isArray() {
  if (Array.isArray) {
    return Array.isArray;
  }
  function is_array(any) {
    return Object.prototype.toString.call(any) === '[object Array]';
  }
  return is_array;
}

/**
 * @param {*} any value.
 * @return {boolean} x is an Array.
 */
var isArray = init_isArray();

/**
 * @param {*} x any value.
 * @return {boolean} "typeof x" is Primitive.
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
 * @param {!Object} x any object.
 * @return {Object} copied new object.
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
 * @param {*} default_value instead of opt_arg.
 * @param {*=} opt_arg argument by called original function.
 * @param {(function(*,*):*)=} opt_callback optional modifier.
 * @return {*} supplemented default value,
 * or value modified by optional callback.
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
 * @param {*} x any object.
 * @param {number=} opt_from slice begin index.
 * @param {number=} opt_to slice end index.
 * @return {Array} x to array.
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
      from = supplement(0, opt_from, function(d, v) {
        return Math.min(v, args.length - 1);
      }),
      to = supplement(args.length, opt_to, function(d, v) {
        return Math.min(d, Math.max(0, v));
      });
  return args.slice(from, to);
}


if (typeof exports !== 'undefined') {
  /** @type {function(*):boolean} */
  exports.isEmpty = isEmpty;

  /** @type {function(*):boolean} */
  exports.isArray = isArray;

  /** @type {function(*):boolean} */
  exports.isPrimitive = isPrimitive;

  /** @type {function(*):*} */
  exports.clone = clone;

  /** @type {function(*, (*)=, (function(*,*):*)=} */
  exports.supplement = supplement;

  /** @type {function(*, number=, number=):Array} */
  exports.asArray = asArray;
}
// EOF
