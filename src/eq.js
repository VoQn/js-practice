'use strict';

var O, isArray, isPrimitive;

if (require) {
  O = require('./object');
  isArray = O.isArray;
  isPrimitive = O.isPrimitive;
}

/**
 * format function.toString()
 * @param {string} expr String of function.
 * @return {string} format function expression.
 */
function replaceSpaces(expr) {
  return expr.replace(/\s*\{\s*/,
           ' { ').replace(/\s*\}\s*/,
           ' }').replace(/\s*,\s*/,
           ', ').replace(/\s*;\s*/,
           '; ').replace(/\s+/, ' ');
}

/**
 * @param {function(...*):*} a function object.
 * @param {function(...*):*} b function object.
 * @return {boolean} a & b is same meaning or not.
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
 * @param {*} a something object.
 * @param {*} b something object.
 * @return {boolean} a & b are same object.
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
  if (isArray(a) && isArray(b)) {
    if (a.length === b.length) {
      for (i = 0, l = a.length; i < l; i++) {
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
  /** @type {function(*):boolean} */
  exports.isArray = isArray;

  /** @type {function(*):boolean} */
  exports.isPrimitive = isPrimitive;

  /** @type {function(*):replaceSpaces} */
  exports.replaceSpaces = replaceSpaces;

  /** @type {function(function(...*):*, function(...*):*): boolean} */
  exports.isSameFunction = isSameFunction;

  /** @type {function(*,*):boolean} */
  exports.deepEq = deepEq;
}
// EOF
