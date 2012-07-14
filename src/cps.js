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

  var _now = function() {
    return new Date().valueOf();
  };

  if (typeof process !== 'undefined' && process.nextTick) {
    cps.next = function(fn, var_args) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (args.length) {
        process.nextTick(function() {
          fn.apply(null, args);
        });
      } else {
        process.nextTick(function() {
          fn();
        });
      }
    };
  } else {
    cps.next = function(fn, var_args) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (args.length) {
        setTimeout(function() {
          fn.apply(null, args);
        }, 1);
      } else {
        setTimeout(fn, 1);
      }
    }
  }

  cps.TIME_SLICE = 16;

  var _trampoline = function(context) {
    var remain = context !== undefined && context.func,
        time_stamp = _now(),
        limit = time_stamp + cps.TIME_SLICE;
    while (remain && time_stamp < limit) {
      context = context.args ?
        context.func.apply(null, context.args) :
        context.func();
      time_stamp = _now();
      remain = context !== undefined && context.func;
    }
    if (remain) {
      cps.next(_trampoline, context);
    }
  };

  cps.trampoline = function(fn_context) {
    return function(var_args) {
      var args = Array.prototype.slice.call(arguments);
      cps.next(_trampoline, {func: fn_context, args: args});
    };
  };

  var _each_context = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length, err = undefined,
        iter = function() {
          acc(arr[i], i, function(error) {
            if (error) {
              err = error;
            }
            c++;
          });
          i++;
          return loop_;
        },
        loop = function() {
          if (err || c >= l) {
            return {func: callback, args: [err]};
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  cps.each = cps.trampoline(_each_context);

  var _map_context = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length,
        err = undefined, rs = [],
        iter = function() {
          var j = i;
          acc(arr[i], i, function(error, result) {
            if (error) {
              err = error;
            } else {
              rs[j] = result;
            }
            c++;
          });
          i++;
          return loop_;
        },
        loop = function() {
          if (err) {
            return {func: callback, args: [err]};
          }
          if (c >= l) {
            return {func: callback, args: [err, rs]};
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  cps.map = cps.trampoline(_map_context);

  var _filter_context = function(evaluate) {
    return function(arr, acc, callback) {
      var i = 0, j = 0, c = 0, l = arr.length,
          err = null, rs = [],
          iter = function() {
            var x = {index: i, value: arr[i]};
            acc(arr[i], i, function(error, result) {
              if (error) {
                err = error;
              } else if (evaluate(result)) {
                rs[j] = x;
                j++;
              }
              c++;
            });
            i++;
            return loop_;
          },
          byIndex = function(a, b) {
            return a.index - b.index;
          },
          passValue = function(x, k, next) {
            next(null, x.value);
          },
          sort = function() {
            return _map_context(
                rs.sort(byIndex),
                passValue,
                callback);
          },
          loop = function() {
            if (err) {
              return {func: callback, args: [err]};
            }
            if (c >= l) {
              return sort_;
            }
            if (i < l) {
              return iter_;
            }
            return loop_;
          },
          iter_ = {func: iter},
          sort_ = {func: sort},
          loop_ = {func: loop};
      return loop_;
    };
  };

  var _id = function(x) { return x; }
  var _not = function(x) { return !x; }

  cps.filter = cps.trampoline(_filter_context(_id));
  cps.reject = cps.trampoline(_filter_context(_not));

  var _detect_context = function(arr, acc, callback) {
    var i = 0, c = 0, finished = false, l = arr.length,
        err = undefined, r = undefined,
        iter = function() {
          var x = arr[i];
          acc(x, i, function(error, result) {
            if (error) {
              err = error;
            } else if (result) {
              r = x;
              finished = true;
            }
            c++;
          });
          i++;
          return loop_;
        },
        loop = function() {
          if (err || finished || c >= l) {
            return {func: callback, args: [err, r]};
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  cps.detect = cps.trampoline(_detect_context);

  var _fromTo_context = function(arr, acc, callback) {
    var ini = Math.round(arr[0]),
        end = Math.round(arr[1]),
        inc = arr.length > 2 ? Math.abs(arr[2]) : 1,
        next = (end - ini >= 0) ?
          function(x) { return x + inc; } :
          function(x) { return x - inc; },
        i = 0, c = 0, l = Math.abs(end - ini) + 1,
        err = undefined, rs = [],
        x = ini,
        iter = function() {
          var j = i;
          acc(x, i, function(error, result) {
            if (error) {
              err = error;
            } else {
              rs[j] = result;
            }
            c++;
          });
          i++;
          x = next(x);
          return loop_;
        },
        loop = function() {
          if (err || c >= l) {
            return {func: callback, args: [err, rs]};
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  cps.fromTo = cps.trampoline(_fromTo_context);

  var _reduce_context = function(arr, acc, callback, opt_init) {
    var i = 0, c = 0, l = arr.length,
        err = undefined, r = undefined,
        iter = function() {
          acc(r, arr[i], i, function(error, result) {
            if (error) {
              err = error;
            } else {
              r = result;
            }
            c++;
          });
          i++;
          return loop_;
        },
        loop = function() {
          if (err || c >= l) {
            return {func: callback, args: [err, r]};
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    if (opt_init !== undefined) {
      r = opt_init;
    } else if (arr.length < 1) {
      err = new TypeError('Array length is 0 and no init value');
    } else {
      r = arr[0];
      i = 1;
      c = 1;
    }
    return loop_;
  };

  cps.reduce = cps.trampoline(_reduce_context);

})(this);
