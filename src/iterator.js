(function(root) {
  'use strict';

  var iterator = {},
      old_iterator = root.iterator;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = iterator;
  } else {
    root.iterator = iterator;
  }

  iterator.noConflict = function() {
    root.iterator = old_iterator;
    return iterator;
  };

  iterator.each = function(arr, acc) {
    var l = arr.length, i;
    for (i = 0; i < l; i++) {
      acc(arr[i], i, arr);
    }
  };

  iterator.map = function(arr, acc) {
    var results = [], l = arr.length, i;
    for (i = 0; i < l; i++) {
      results[i] = acc(arr[i], i, arr);
    }
    return results;
  };

  iterator.reduce = function(arr, acc, init) {
    var memo = init, l = arr.length, i;
    for (i = 0; i < l; i++) {
      memo = acc(memo, arr[i], i, arr);
    }
    return memo;
  };

  iterator.keys = function(obj) {
    var keys = [], i = 0, k;
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        keys[i] = k;
        i++;
      }
    }
    return keys;
  };

  iterator.index = function(value, index) {
    return {index: index, value: value};
  };

  iterator.indexed = function(arr) {
    return iterator.map(arr, iterator.index);
  };

  iterator.fromTo = function(from, to, step) {
    var ini = Math.round(from),
        end = Math.round(to),
        inc = step ? Math.abs(step) : 1,
        r = [],
        next = (end - ini >= 0) ?
          function(x) { return x + inc } :
          function(x) { return x - inc },
        l = Math.abs(end - ini) + 1,
        i, x;
    for (i = 0, x = ini; i < l; x = next(x), i++) {
      r[i] = x;
    }
    return r;
  };

})(this);
