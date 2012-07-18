;(function(root) {
  'use strict';
  var cps = {},
      old_cps = root.cps;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = cps;
  } else {
    root.cps = cps;
  }

  cps.noComflict = function() {
    root.cps = old_cps;
    return cps;
  };

  var __slice = Array.prototype.slice;

  var _next_process = (typeof process !== 'undefined' && process.nextTick) &&
    function(fn, var_args) {
      var args = __slice.call(arguments, 1);
      if (args.length) {
        process.nextTick(function() {
          fn.apply(null, args);
        });
        return;
      }
      process.nextTick(fn);
    };

  var _next_default = function(fn, var_args) {
    var args = __slice.call(arguments, 1);
    if (args.length) {
      setTimeout.apply(null, [fn, 0].concat(args));
      return;
    }
    setTimeout(fn, 0);
  };

  cps.next = _next_process || _next_default;

  cps.each = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length, finished = false;
    for (; i < l; i++) {
      acc(arr[i], i, function(error) {
        if (finished) return;
        if (error) {
          finished = true;
          callback(error);
          return;
        }
        if (++c >= l) callback();
      });
      if (finished) return;
    }
  };

  cps.nmap = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length, finished = false;
    for (; i < l; i++) {
      (function iterate(value, index) {
        acc(value, index, function(error, result) {
          if (finished) return;
          if (error) {
            finished = true;
            callback(error);
            return;
          }
          arr[index] = result;
          if (++c >= l) callback(undefined, arr);
        });
      })(arr[i], i);
      if (finished) return;
    }
  };

  cps.map = function(arr, acc, callback) {
    cps.nmap(arr.slice(), acc, callback);
  };

  var _cmp_num = function(a, b) {
    return a - b;
  };

  var _ninsert_sort = function(arr, opt_cmp) {
    var cmp = opt_cmp || cps._cmp_num;
    for (var i = 1, l = arr.length; i < l; i++) {
      var v = arr[i];
      for (var j = i - 1; j >= 0; j--) {
        if (cmp(arr[j], v) > 0) {
          arr[j + 1] = arr[j];
        } else {
          break;
        }
      }
      arr[j + 1] = v;
    }
  };

  var _nquick_sort = function(arr, cmp) {
    var stack = [0, arr.length - 1];
    while (stack.length) {
      var tail = stack.pop(),
          head = stack.pop(),
          pivot = arr[head + ((tail - head) >>> 1)],
          i = head - 1,
          j = tail + 1,
          remain = true;
      while (remain) {
        while (cmp(arr[++i], pivot) < 0);
        while (cmp(arr[--j], pivot) > 0);
        if (i >= j) {
          remain = false;
        } else {
          tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
      }
      if (head < i - 1) stack.concat([head, i - 1]);
      if (j + 1 < tail) stack.concat([j + 1, tail]);
    }
    return arr;
  };

  var _filter = function(evaluate) {
    return function(arr, acc, callback) {
      var j = 0, c = 0, finished = false, rs = [];
      for (var i = 0, l = arr.length; i < l; i++) {
        (function iterate(value, index) {
          acc(value, index, function(error, result) {
            if (finished) return;
            if (error) {
              finished = true;
              callback(error);
              return;
            }
            if (evaluate(result)) {
              rs[j++] = {index: index, value: value};
            }
            if (++c >= l) {
              _nquick_sort(rs, function(a, b) {
                return a.index - b.index;
              });
              for (var k = 0; k < j; k++) {
                rs[k] = rs[k].value;
              }
              callback(undefined, rs);
            }
          });
        })(arr[i], i);
        if (finished) return;
      }
    };
  };

  cps.filter = _filter(function(x) { return x; });

  cps.reject = _filter(function(x) { return !x; });

  cps.detect = function(arr, acc, callback) {
    var c = 0, finished = false;
    for (var i = 0, l = arr.length; i < l; i++) {
      (function iterate(value, index) {
        acc(value, index, function(error, result) {
          if (finished) return;
          if (error) {
            finished = true;
            callback(error);
            return;
          }
          if (result) {
            finished = true;
            callback(undefined, value);
            return;
          }
          if (++c >= l) callback();
        });
      })(arr[i], i);
      if (finished) return;
    }
  };

  cps.reduce = function(arr, acc, callback, opt_init) {
    if (arguments.length < 4 && arr.length < 1) {
      callback(new TypeError(
            'Array length is 0 and no init value'));
      return;
    }
    var r = opt_init || arr.shift(),
        c = 0, finished = false;
    for (var i = 0, l = arr.length; i < l; i++) {
      acc(r, arr[i], i, function(error, result) {
        if (finished) return;
        if (error) {
          finished = true;
          callback(error);
          return;
        }
        r = result;
        if (++c >= l) callback(undefined, r);
      });
      if (finished) return;
    }
  };

  cps.fromTo = function(arr, acc, callback) {
    var ini = Math.round(arr[0]),
        end = Math.round(arr[1]),
        incv = arr.length > 2 ? Math.abs(arr[2]) : 1,
        inc = (end - ini >= 0) ? incv : (-incv),
        c = 0,
        l = Math.abs(end - ini) / incv + 1,
        finished = false,
        rs = [];
    for (var i = 0, x = ini; i < l; i++, x += inc) {
      acc(x, i, function(error, result) {
        if (finished) return;
        if (error) {
          finished = true;
          callback(error);
          return;
        }
        rs[c++] = result;
        if (c >= l) callback(undefined, rs);
      });
      if (finished) return;
    }
  };

})(this);
