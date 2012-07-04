
'use strict';

var O, isArray, isPrimitive;

if (require) {
  O = require('./object');
  isArray = O.isArray;
  isPrimitive = O.isPrimitive;
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
  if (isArray(a) && isArray(b)) {
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
// EOF
