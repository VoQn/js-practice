;(function(root) {
  'use strict';

  var equals = {}, object_util, isArray, isPrimitive;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = equals;
  } else {
    root.equals = equals;
  }

  if (require) {
    object_util = require('./object');
    isArray = object_util.isArray;
    isPrimitive = object_util.isPrimitive;
  }

  /**
   * format function.toString()
   * @param {string} expr String of function.
   * @return {string} format function expression.
   */
  var _replace_spaces = function(expr) {
    return expr.replace(/\s*\{\s*/,
        ' { ').replace(/\s*\}\s*/,
        ' }').replace(/\s*,\s*/,
        ', ').replace(/\s*;\s*/,
        '; ').replace(/\s+/, ' ');
  };

  equals.replace_spaces = _replace_spaces;

  /**
   * @param {function(...*):*} a function object.
   * @param {function(...*):*} b function object.
   * @return {boolean} a & b is same meaning or not.
   */
  var isSameFunction = function(a, b) {
    if (a === b) {
      return true;
    }
    if (a.name !== b.name || a.length !== b.length) {
      return false;
    }
    var as = _replace_spaces(a.toString()),
        bs = _replace_spaces(b.toString());
    return as === bs;
  };

  equals.isSameFunction = isSameFunction;

  /**
   * @param {*} a something object.
   * @param {*} b something object.
   * @return {boolean} a & b are same object.
   */
  var deepEq = function(a, b) {
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
  };

  equals.deepEq = deepEq;

})(this);
// EOF
