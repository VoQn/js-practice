'use strict';

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
  var type_expr = typeof x,
      primitives = [
        'undefined', 'null', 'boolean', 'number', 'string'
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
 * @description format function.toString()
 * @param {string} expr
 * @return {string}
 */
function replaceSpaces(expr) {
  return expr.replace(/\s*\{\s*/,
           ' { ').replace(/\s*\}\s*/,
           ' }').replace(/\s*,\s*/,
           ', ').replace(/\s*;\s*/,
           '; ').replace(/\s+/, ' ');
}

/**
 * @description two function object are same meaning or not
 * @param {function(...*):*} a
 * @param {function(...*):*} b
 * @return {boolean}
 */
function isSameFunction(a, b) {
  if (a === b) {
    return true;
  }
  if (a.name !== b.name || a.length !== b.length) {
    return false;
  }
  var as = replaceSpaces(a.toString()),
      bs = replaceSpaces(b.toString());
  return as === bs;
}

/**
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
function deepEq(a, b) {
  var i, l, a_ps, b_ps;
  // Same identifier, or alias
  if (a === b) {
    return true;
  }
  // Primitive
  if (isPrimitive(a) && isPrimitive(b)) {
    return a === b;
  }
  // Array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === b.length) {
      for (i = 0, l = a.length; i < l; i++){
        if (!deepEq(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  // Function
  if (typeof a === 'function' && typeof b === 'function') {
    return isSameFunction(a, b);
  }
  // Object
  if (a.constructor === b.constructor) {
    a_ps = Object.getOwnPropertyNames(a);
    b_ps = Object.getOwnPropertyNames(b);
    if (a_ps.length !== b_ps.length) {
      return false;
    }
    for (i = 0, l = a_ps.length; i < l; i++) {
      if (!deepEq(a[a_ps[i]], b[b_ps[i]])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

if (typeof exports !== 'undefined') {
  exports.isArray = isArray;
  exports.isPrimitive = isPrimitive;
  exports.replaceSpaces = replaceSpaces;
  exports.isSameFunction = isSameFunction;
  exports.deepEq = deepEq;
}
